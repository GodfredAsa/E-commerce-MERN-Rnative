const  errorHandler = (err, req, res, next) => {
  if (err && err.name === "UnauthorizedError") {
    res.status(401).json({ message: "User not authorized" });
  }
  if (err && err.name === "ValidationError") {
    res.status(404).json({ message: err });
  }
  console.log("===========================")
  console.log(err);
  res.status(500).json(err);
}

module.exports = errorHandler;
