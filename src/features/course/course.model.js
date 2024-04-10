// CREATE TABLE courses (
//     course_id SERIAL PRIMARY KEY,
//     course_name VARCHAR(100) NOT NULL,
//     instructor VARCHAR(100) NOT NULL,
//     description TEXT,
//     price NUMERIC(10, 2) NOT NULL,
//     level VARCHAR(100),
//     category VARCHAR(100),
//     popularity INTEGER,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
export default class CourseModel {
  constructor(
    course_name,
    instructor,
    description,
    price,
    level,
    category,
    popularity
  ) {
    this.course_name = course_name;
    this.instructor = instructor;
    this.description = description;
    this.price = price;
    this.level = level;
    this.category = category;
    this.popularity = popularity;
  }
}
