import express from "express";
import checkSuperAdmin from "../../middleware/checkSuperAdmin.middleware.js";
import jwtAuth from "../../middleware/jwt.middleware.js";
import courseDetailValidtor from "../../middleware/courseData.validator.js";
import CourseController from "./course.controller.js";

const CourseRoute = express.Router();
const courseController = new CourseController();
CourseRoute.post(
  "/insertCourse",
  jwtAuth,
  checkSuperAdmin,
  courseDetailValidtor,
  (req, res, next) => {
    courseController.insertCourse(req, res, next);
  }
);
CourseRoute.get("/getCourse", (req, res, next) => {
  courseController.fetchCourse(req, res, next);
});
export default CourseRoute;

// {
//     "email": "superUser@elearning.com",
//     "password": "superUser12@@",
//     "username":"superUser"
//   }
