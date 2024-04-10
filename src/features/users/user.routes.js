import express from "express";
import UserController from "./user.controller.js";
import jwtAuth from "../../middleware/jwt.middleware.js";
import UserDetailsValidator from "../../middleware/userDetails.validator.js";

const UserRouter = express.Router();

const userController = new UserController();
UserRouter.get("/getUserDetails", jwtAuth, (req, res, next) => {
  userController.getUserDetails(req, res, next);
});

UserRouter.post(
  "/signUp",
  UserDetailsValidator.validateAll,
  (req, res, next) => {
    userController.signUp(req, res, next);
  }
);
UserRouter.post("/signIn", (req, res, next) => {
  userController.signIn(req, res, next);
});
UserRouter.put(
  "/updateDetails",
  jwtAuth,
  UserDetailsValidator.validateUpdateDetails,
  (req, res, next) => {
    userController.updateUserDetails(req, res, next);
  }
);
UserRouter.put("/updatePassword", jwtAuth, (req, res, next) => {
  userController.userPasswordReset(req, res, next);
});
UserRouter.put("/forgetPassword", (req, res, next) => {
  userController.forgetPassword(req, res, next);
});
UserRouter.get("/fetchUserCourse", jwtAuth, (req, res, next) => {
  userController.fetchUserCourses(req, res, next);
});
UserRouter.post("/addCourse", jwtAuth, (req, res, next) => {
  userController.addCourse(req, res, next);
});
export default UserRouter;
