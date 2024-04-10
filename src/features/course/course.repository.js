import sql from "../../config/postgres.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

export default class CourseRepository {
  async fetchCourse(limit, offset) {
    let query = "";
    if (limit) {
      query = `SELECT * FROM courses
            ORDER BY course_id LIMIT ${limit} 
            OFFSET ${offset ? offset : 0}`;
    } else {
      query = `SELECT * FROM courses
        ORDER BY course_id
        OFFSET ${offset ? offset : 0}`;
    }
    try {
      let result = await sql.unsafe(query);
      return result;
    } catch (error) {
      console.log("From fetchCourse CourseRepository: ", error);

      throw new ApplicationError("Something went wrong", 503);
    }
  }

  async insertCourse(newCourse) {
    let {
      course_name,
      instructor,
      description,
      price,
      level,
      category,
      popularity,
    } = newCourse;
    let query = `INSERT INTO courses (course_name ,
        instructor,
        description ,
        price ,
        level,
        category,
        popularity)
        VALUES ($1, $2,$3,$4,$5,$6,$7) RETURNING *`;
    price = Number(price);
    popularity = Number(popularity);
    try {
      console.log("inserting course");
      let result = await sql.unsafe(query, [
        course_name,
        instructor,
        description,
        price,
        level,
        category,
        popularity,
      ]);
      console.log(result);
      return result;
    } catch (error) {
      console.log("From insertCourse CourseRepository: ", error);

      throw new ApplicationError("Something went wrong", 503);
    }
  }
  async courseExist(courseId) {
    try {
      let result = await sql.unsafe(
        `SELECT EXISTS (
        SELECT 1 
        FROM courses 
        WHERE course_id = $1
        ) AS course_exists;`,
        [courseId]
      );
      console.log("course exists from courseRepository", result);
      //return false;
      return result[0].course_exists;
    } catch (error) {
      console.log("From courseExist CourseRepository: ", error);
      throw new ApplicationError("Something went wrong", 503);
    }
  }
  async checkEnrollmentExists(userId, courseId) {
    try {
      //Check if the user is already enrolled in the course
      let checkResult = await sql.unsafe(
        `SELECT COUNT(*) FROM user_courses WHERE user_id =$1 AND course_id = $2;`,
        [userId, courseId]
      );
      console.log("Enrollment check result from ", checkResult);
      return checkResult[0].count;
    } catch (error) {
      console.log("From checkEnrollmentExists CourseRepository: ", error);
      throw new ApplicationError("Something went wrong", 503);
    }
  }
  async addCourseToUser(userId, courseId) {
    try {
      //Insert the enrollment record and return the inserted object
      let insertionResult = await sql.unsafe(
        `INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2) RETURNING user_id, course_id;`,
        [userId, courseId]
      );
      return insertionResult;
    } catch (error) {
      console.log("From addCourseToUser CourseRepository: ", error);
      throw new ApplicationError("Something went wrong", 503);
    }
  }
  async fetchUserCourses(userId) {
    try {
      let result = await sql.unsafe(
        `SELECT * from user_courses WHERE user_id = $1`,
        [userId]
      );
      console.log("fetchUserCourses from course repository ", result);
      return result;
    } catch (error) {
      console.log("From fetchUserCourses CourseRepository: ", error);
      throw new ApplicationError("Something went wrong", 503);
    }
  }
}
