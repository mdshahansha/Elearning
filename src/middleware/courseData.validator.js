export default function courseDetailValidtor(req, res, next) {
  const {
    course_name,
    instructor,
    description,
    price,
    level,
    category,
    popularity,
  } = req.body;
  if (course_name === undefined || course_name === null) {
    return res.status(400).send("Course name is required");
  }

  if (instructor === undefined || instructor === null) {
    return res.status(400).send("Instructor name is required");
  }

  if (description === undefined || description === null) {
    return res.status(400).send("Description is required");
  }

  if (price === undefined || price === null) {
    return res.status(400).send("Price is required");
  }

  if (level === undefined || level === null) {
    return res.status(400).send("Level is required");
  }

  if (category === undefined || category === null) {
    return res.status(400).send("Category is required");
  }

  if (popularity === undefined || popularity === null) {
    return res.status(400).send("Popularity is required");
  }
  console.log("Course data validated succesfully");
  next();
}
