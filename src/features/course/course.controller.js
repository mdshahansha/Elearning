import { ApplicationError } from "../../error-handler/applicationError.js";
import CourseModel from "./course.model.js";
import CourseRepository from "./course.repository.js";

export default class CourseController {
  constructor() {
    this.courseRepository = new CourseRepository();
  }
  async fetchCourse(req, res, next) {
    let { limit, offset } = req.params;
    try {
      let result = await this.courseRepository.fetchCourse(limit, offset);
      return res.status(200).json({ result });
    } catch (error) {
      console.log("From fetchCourse course controller: ", error);
      throw new ApplicationError("Something went wrong", 503);
    }
  }
  async insertCourse(req, res, next) {
    try {
      const {
        course_name,
        instructor,
        description,
        price,
        level,
        category,
        popularity,
      } = req.body;
      let newCourse = new CourseModel(
        course_name,
        instructor,
        description,
        price,
        level,
        category,
        popularity
      );
      console.log(newCourse);
      let result = await this.courseRepository.insertCourse(newCourse);
      return res.status(201).json({ response: "Course Added", result });
    } catch {
      console.log("From insertCourse course controller: ", error);
      throw new ApplicationError("Something went wrong", 503);
    }
  }
}
