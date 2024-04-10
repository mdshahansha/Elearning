import { hash } from "bcrypt";
import sql from "../../config/postgres.js";
import { UserError } from "../../error-handler/userError.js";

export default class UserRepository {
  async fetchOTP(email) {
    try {
      let record =
        await sql.unsafe(`SELECT * FROM otps WHERE email = '${email}';
      `);
      return record;
    } catch (error) {
      console.log("Error from user repository fetch otp", error);
      throw new UserError("Something went wrong", 503);
    }
  }
  async storeOTP(email, newOtp, timestamp) {
    try {
      let hashed_otp = await sql.unsafe(
        `INSERT INTO otps (email, hashed_otp, updated_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET hashed_otp = excluded.hashed_otp, updated_at = excluded.updated_at
      RETURNING hashed_otp;`,
        [email, newOtp, timestamp]
      );

      return hashed_otp;
    } catch (error) {
      console.log("Error from storeOtp method coming user.repository: ", error);
      if (error.code && error.code == 23505) {
        throw new UserError(`${error.detail}`, 503);
      }
      throw new UserError("Something went wrong", 503);
    }
  }

  async updateUserPassword(userId, newPassword) {
    // Initialize the update query
    let updateQuery = `UPDATE users SET`;

    // Initialize the returning part of the query
    let returningPart = ` RETURNING user_id, email, username`;

    updateQuery += ` password = '${newPassword}',`;

    // Remove the trailing comma from the update query
    updateQuery = updateQuery.slice(0, -1);

    // Add the WHERE clause to specify the user to be updated
    updateQuery += ` WHERE user_id = '${userId}'`;

    // Append returningPart to include the updated user record
    updateQuery += returningPart;
    // Execute the update query
    //console.log(updateQuery);
    try {
      const result = await sql.unsafe(updateQuery);

      let updatedUser = {};
      updatedUser = result[0];

      return updatedUser;
    } catch (error) {
      console.log(error);
      if (error.code && error.code == 23505) {
        throw new UserError(`${error.detail}`, 503);
      }
      throw new UserError("Something went wrong", 503);
    }
  }
  async updateUser(userId, newUsername, newEmail) {
    // Initialize the update query
    let updateQuery = `UPDATE users SET`;

    // Initialize the returning part of the query
    let returningPart = ` RETURNING user_id, email, username`;

    // Check if newUsername is defined, if yes, add it to the update query
    if (newUsername !== undefined) {
      updateQuery += ` username = '${newUsername}',`;
    }

    // Check if newEmail is defined, if yes, add it to the update query
    if (newEmail !== undefined) {
      updateQuery += ` email = '${newEmail}',`;
    }

    // Remove the trailing comma from the update query
    updateQuery = updateQuery.slice(0, -1);

    // Add the WHERE clause to specify the user to be updated
    updateQuery += ` WHERE user_id = '${userId}'`;

    // Append returningPart to include the updated user record
    updateQuery += returningPart;
    // Execute the update query
    console.log(updateQuery);
    try {
      const result = await sql.unsafe(updateQuery);
      //console.log(result);
      let updatedUser = {};
      updatedUser = result[0];
      // res.status(200).json(updatedUser);
      return updatedUser;
    } catch (error) {
      console.log(error);
      if (error.code && error.code == 23505) {
        throw new UserError(`${error.detail}`, 503);
      }
      throw new UserError("Something went wrong", 503);
    }
  }
  async findUserByUserId(userId) {
    const result = await sql.unsafe(
      `SELECT user_id, username, password FROM users WHERE user_id = '${userId}';`
    );
    // console.log(result);
    return result[0];
  }
  async findUser(email) {
    try {
      const result = await sql.unsafe(
        `SELECT user_id, username, password FROM users WHERE email = '${email}';`
      );
      // console.log(result);
      if (result.length > 0) return result[0];
      else {
        return result;
      }
    } catch (error) {
      throw new ApplicationError("Something wrong with the database", 503);
    }
  }
  async findByEmail(email) {
    const result = await sql.unsafe(
      `SELECT EXISTS (SELECT 1 FROM users WHERE email = '${email}');`
    );
    console.log(result[0].exists);
    return result[0].exists;
  }
  async signUp(newUser) {
    try {
      const { username, email, hashedPassword } = newUser;
      //console.log("newUser from repo: ", newUser);
      //   const query =
      //     "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
      //   const values = [username, email, hashedPassword];
      const result =
        await sql`INSERT INTO users (username, email, password) VALUES(${username}, ${email}, ${hashedPassword}) RETURNING  user_id,
        username, email;`;
      // console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      if (error.code && error.code == 23505) {
        throw new UserError(`${error.detail}`, 503);
      }
      throw new UserError("Something went wrong", 503);
    }
  }
}
