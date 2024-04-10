import sql from "../config/postgres.js";

export default async function checkSuperAdmin(req, res, next) {
  let userId = req.body.userId;
  let result = await sql.unsafe(
    `SELECT * from superadmins WHERE user_id = $1`,
    [userId]
  );
  if (result.length > 0) {
    req.body.superAdmin = true;
  } else {
    return res.status(401).send("This request can only be made by super admin");
  }
  next();
}
