import sql from "./postgres.js";

let generationQueries = [
  //Table for storing information about users
  `CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(500) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );`,
  //Table for storing information about courses
  `CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    level VARCHAR(100),
    category VARCHAR(100),
    popularity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,
  //Table for mapping users to courses (many-to-many relationship)
  `CREATE TABLE user_courses (
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        PRIMARY KEY (user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
    );`,
  // for generating otps table
  `CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE REFERENCES users(email),
    hashed_otp TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`,
  // for maintaing superadmins - a user have to be made superadmin manually
  // by running a insert query for inserting the user_id into superadmins table
  // Example - SuperAdmin Credential - {
  //   "username": "superAdmin",
  //   "email": "superAdmin@elearning.com",
  //   "password": "newPassword@123"
  // }
  `CREATE TABLE superadmins (
    user_id INT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );`,
  // `ALTER TABLE otps
  // ALTER COLUMN created_at SET DATA TYPE TIMESTAMPTZ,
  // ALTER COLUMN updated_at SET DATA TYPE TIMESTAMPTZ;`,
  // `ALTER TABLE courses
  // ADD COLUMN level VARCHAR(100),
  // ADD COLUMN category VARCHAR(100),
  // ADD COLUMN popularity INTEGER;`
];

export default function createReqTables() {
  generationQueries.forEach(async (query) => {
    //const result = await sql`${query}`;
    try {
      const result = await sql.unsafe(query);
      console.log(result);
    } catch (error) {
      // console.log(error);
      if (error.code === "42P07") {
        console.log("This table already exist");
      }
    }
  });
}
