import "./env.js";
import express from "express";
import swagger from "swagger-ui-express";
import UserRouter from "./src/features/users/user.routes.js";
import createReqTables from "./src/config/tableGeneration.js";
import { UserError } from "./src/error-handler/userError.js";
import apiDocs from "./swagger.json" assert { type: "json" };
import CourseRoute from "./src/features/course/course.routes.js";
import { errorLog, requestLogger } from "./src/middleware/logger.middleware.js";
const server = express();
server.use(express.json());
server.get("/", (req, res) => {
  res.send(
    "Welcome to  this project - visit https://e-learning-backend-production-3d18.up.railway.app/api-docs/ - for api doc."
  );
});

server.use("/api-docs", swagger.serve, swagger.setup(apiDocs));
server.use(requestLogger);
server.use("/api/user", UserRouter);
server.use("/api/course", CourseRoute);

server.use((err, req, res, next) => {
  let logData = `\n${new Date().toString()} \nreq.body = ${JSON.stringify(
    req.body
  )}\nreq.url = ${req.url}\n${JSON.stringify(err)}`;

  errorLog(logData);

  if (err instanceof UserError) {
    return res.status(err.code).send(err.message);
  }
  console.log(err);
  res.status(500).send("Something went wrong");
});
const port = process.env.PORT || 3400;
server.listen(port, () => {
  createReqTables();
  console.log(`Server has started at port ${port}`);
});
