export default class UserDetailsValidator {
  static emailValidator(email) {
    //const email = req.body.email;

    // Regular expression for validating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      console.log(email);
      console.log(emailRegex.test(email));
      return false;
      //   return res.status(400).json({ error: "Invalid email format" });
    }
    return true;
    //if (!callFromAll) next();
  }

  static userNameValidator(username) {
    //const username = req.body.username;

    // Validate username based on your requirements
    // For example, you may check for minimum length, disallow certain characters, etc.

    // For demonstration, let's assume username should be at least 3 characters long
    if (username.length < 3) {
      return false;
      //   return res
      //     .status(400)
      //     .json({ error: "Username must be at least 3 characters long" });
    }
    return true;
    //if (!callFromAll) next();
  }

  static passwordValidator(password) {
    //const password = req.body.password;

    // Regular expression for validating password
    const passwordRegex = /^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    if (!passwordRegex.test(password)) {
      return false;
      //   return res.status(400).json({
      //     error:
      //       "Password must be at least 8 characters long and contain at least 1 special character",
      //   });
    }
    return true;
    // if (!callFromAll) next();
  }
  static validateAll(req, res, next) {
    // this.passwordValidator(req, res, next, true);
    // this.userNameValidator(req, res, next, true);
    // this.emailValidator(req, res, next, true);
    let passwordRes = UserDetailsValidator.passwordValidator(req.body.password);
    let emailRes = UserDetailsValidator.emailValidator(req.body.email);
    let userNameRes = UserDetailsValidator.userNameValidator(req.body.username);

    if (!passwordRes) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and contain at least 1 special character",
      });
    }

    if (!emailRes) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!userNameRes) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters long" });
    }

    next();
  }

  // Custom middleware to validate update details
  static validateUpdateDetails(req, res, next) {
    const { newUsername, newEmail } = req.body;

    // Check if either newUsername or newEmail is provided
    if (!newUsername && !newEmail) {
      return res
        .status(400)
        .json({ error: "At least one of newUsername or newEmail is required" });
    }
    if (newUsername && !UserDetailsValidator.userNameValidator(newUsername)) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters long" });
    }
    if (newEmail && !UserDetailsValidator.emailValidator(newEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    next();
    // // Apply validation based on the provided fields
    // const validations = [];
    // if (newUsername) {
    //   validations.push(this.userNameValidator);
    // }
    // if (newEmail) {
    //   validations.push(this.emailValidator);
    // }

    // // Run validations sequentially
    // const runValidations = async () => {
    //   for (const validation of validations) {
    //     await validation(req, res, (err) => {
    //       if (err) {
    //         return res.status(400).json({ error: err.message });
    //       }
    //     });
    //   }
    //   next();
    // };

    // runValidations();
  }
}
