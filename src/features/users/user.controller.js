import UserModel from "./user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import OTP from "otp";
import UserRepository from "./user.repository.js";
import { UserError } from "../../error-handler/userError.js";
import UserDetailsValidator from "../../middleware/userDetails.validator.js";
import CourseRepository from "../course/course.repository.js";

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
    this.courseRepository = new CourseRepository();
  }

  async signUp(req, res, next) {
    //console.log(req.body);
    let { username, email, password } = req.body;
    try {
      // // Password validation regex: at least 1 special character and minimum length of 8 characters
      // const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

      // // Check if password meets the criteria
      // if (!passwordRegex.test(password)) {
      //   throw new UserError(
      //     "Password must be at least 8 characters long and contain at least one special character",
      //     400
      //   );
      // }

      let user = await this.userRepository.findByEmail(email);
      if (user == true) {
        throw new UserError("User already exists", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel(username, email, hashedPassword);
      let result = await this.userRepository.signUp(newUser);
      console.log(result);

      res.status(200).send(result);
    } catch (err) {
      console.log("Error form signUp: ", err);
      next(err);
    }
  }
  async signIn(req, res) {
    //console.log(req.body);
    const { email, password } = req.body;
    try {
      const user = await this.userRepository.findUser(email);
      //console.log(user);
      if (Array.isArray(user)) {
        return res.status(404).send("This email do not exists");
      } else {
        const result = await bcrypt.compare(password, user.password);
        if (result) {
          //console.log("from user controller ", user._id.toString());
          // 1. Create our token on successful login
          const token = jwt.sign(
            {
              userId: user.user_id,
              email,
              username: user.username,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );

          // 2. Send the token
          res.status(200).send(token);
        } else {
          res.status(400).send("Incorrect Credential");
        }
      }
      //result = await this.userRepsitory.SignIn(email, password);
    } catch (err) {
      console.log("Error form signIn: ", err);
      throw new ApplicationError("Something wrong with this request", 503);
    }
  }
  async getUserDetails(req, res) {
    try {
      let obj = { username: req.body.username, email: req.body.email };
      console.log("getUserdetails: ", obj);
      return res.status(200).json(obj);
    } catch (error) {
      console.log("Error form getUserDetails: ", err);
      throw new ApplicationError("Something wrong with this request", 503);
    }
  }
  async updateUserDetails(req, res) {
    let { newUsername, newEmail } = req.body;

    //userId is being attached to req body at jwt authenticator level from token payload
    let userId = req.body.userId;
    // console.log(userId);
    // console.log(req.body);
    try {
      let updatedRecord = await this.userRepository.updateUser(
        userId,
        newUsername,
        newEmail
      );
      return res
        .status(201)
        .json({ response: "Updated Successfully", updatedRecord });
    } catch (err) {
      console.log("Error form update user details: ", err);
      throw new ApplicationError("Something wrong with this request", 500);
    }
  }
  async forgetPassword(req, res) {
    let { email, userOtp, newPassword } = req.body;
    try {
      if (!UserDetailsValidator.emailValidator(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      let userData = await this.userRepository.findUser(email);
      //console.log(userData);
      let userId = -1;
      if (Array.isArray(userData)) {
        return res
          .status(400)
          .json({ error: "User does not exists with this email" });
      } else {
        userId = userData.user_id;
      }
      if (userOtp) {
        //verify otp and if correct change the password
        let otpRecord = await this.userRepository.fetchOTP(email);
        let timestamp = otpRecord[0].updated_at;
        const otpTime = new Date(timestamp);

        // Get the current time
        const currentTime = new Date();

        // Calculate the difference in milliseconds
        const timeDifferenceMs = currentTime - otpTime;

        // Convert milliseconds to minutes
        const timeDifferenceMinutes = Math.floor(
          timeDifferenceMs / (1000 * 60)
        );
        // console.log("current time ", currentTime);
        // console.log("otp time", otpTime);
        // console.log("Time difference ", timeDifferenceMinutes);
        console.log(otpRecord);
        if (timeDifferenceMinutes >= 15) {
          return res.status(400).send("OTP has expired, request for new otp");
        }

        if (Number(userOtp) != Number(otpRecord[0].hashed_otp)) {
          return res.status(401).send("OTP did not match");
        }

        if (!UserDetailsValidator.passwordValidator(newPassword)) {
          return res.status(400).json({
            error:
              "Password must be at least 8 characters long and contain at least 1 special character",
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        let response = await this.userRepository.updateUserPassword(
          userId,
          hashedPassword
        );
        if (response) {
          return res.status(201).send("Password Updated Successfully");
        } else {
          return res.status(400).send("Password updation not successful");
        }
      } else {
        let newOTP = new OTP().totp();
        this.userRepository.storeOTP(email, newOTP, new Date());
        const resend = new Resend(process.env.RE_SEND_API_KEY);
        //send otp
        resend.emails.send({
          from: "e-learning@resend.dev",
          to: `${email}`,
          subject: "Otp for password change",
          html: `<p>OTP for password reset is <strong>${newOTP}</strong>! OTP will be valid for only 15 Minutes</p>`,
        });
        return res.status(200).send("OTP sent");
      }
    } catch (error) {
      console.log("Error form forgetPassword usercontroller: ", err);
      throw new ApplicationError("Something wrong with this request", 500);
    }
  }
  async userPasswordReset(req, res) {
    let { userId, newPassword, oldPassword } = req.body;
    let user = await this.userRepository.findUserByUserId(userId);
    //console.log(oldPassword);
    const result = await bcrypt.compare(oldPassword, user.password);
    try {
      if (result) {
        if (!UserDetailsValidator.passwordValidator(newPassword)) {
          console.log(UserDetailsValidator.passwordValidator(newPassword));
          return res
            .status(400)
            .send(
              "Password must be at least 8 characters long and contain at least 1 special character"
            );
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        let response = this.userRepository.updateUserPassword(
          userId,
          hashedPassword
        );
        if (response) {
          return res.status(201).send("Password Updated Successfully");
        } else {
          return res.status(400).send("Password updation not successful");
        }
      } else {
        return res.status(400).send("Old password entered was not correct");
      }
    } catch (error) {
      console.log("Error form userPasswordReset from usercontroller: ", err);
      throw new ApplicationError("Something wrong with this request", 500);
    }
  }
  async addCourse(req, res, next) {
    let { userId, courseId } = req.body;
    try {
      let result = await this.courseRepository.courseExist(courseId);
      if (!result) {
        res.status(400).send("This course do no exists");
      } else {
        let result = await this.courseRepository.checkEnrollmentExists(
          userId,
          courseId
        );
        console.log("Count result from addCourse UserRepo", result);
        if (result > 0) {
          return res.status(400).send("User is already enrolled in the course");
        } else {
          let result = await this.courseRepository.addCourseToUser(
            userId,
            courseId
          );
          return res.status(201).json({
            response: "User successfully enrolled in the course",
            result,
          });
        }
      }
    } catch (error) {
      console.log("Error form addCourse usercontroller: ", err);
      throw new ApplicationError("Something wrong with this request", 500);
    }

    //return res.status(200).send("GOOD, GOOD");
  }
  async fetchUserCourses(req, res, next) {
    try {
      let { userId } = req.body;

      let result = await this.courseRepository.fetchUserCourses(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.log("Error form fetchUserCourses usercontroller: ", err);
      throw new ApplicationError("Something wrong with this request", 500);
    }
  }
}
