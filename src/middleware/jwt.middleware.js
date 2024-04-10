import jwt from "jsonwebtoken";
import UserRepository from "../features/users/user.repository.js";
const jwtAuth = (req, res, next) => {
  // 1. Read the token (As per the convention client will
  // send the token in Authorization header)
  //console.log(req.headers);
  const token = req.headers["authorization"];
  //console.log(token);
  // 2. If no token return error

  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  // 3. Check if token is valid
  // For checking if the token in valid we use .verify() method
  // of jsonwebtoken library, in this we pass the token and the
  // key used to verify that token.
  // This method returns the payload if verification is successful
  // Else it will throw an error in case of modified or expired
  // token. Hence it is a good idea to use try catch
  try {
    //console.log(process.env.JWT_SECRET);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(token);
    req.body.email = payload.email;
    req.body.username = payload.username;
    req.body.userId = payload.userId;
    // console.log(process.env.JWT_SECRET);
    //To making sure that if user updates his email, token with older in email payload can not make request
    if (!new UserRepository().findByEmail(payload.email)) {
      return res.status(401).send("Email does not exists in the database");
    }
    console.log("payload : ", payload);
  } catch (err) {
    // 5. Else return error
    //console.log(err);
    console.log(err);
    return res.status(401).send("Unauthorized / Invalid / Expired - Token");
  }
  // 4. Call next middleware
  next();
};
export default jwtAuth;
