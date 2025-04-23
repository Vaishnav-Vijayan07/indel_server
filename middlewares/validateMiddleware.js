const { validationResult } = require("express-validator");
const CustomError = require("../utils/customError");

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError(
      "Validation failed: " +
        errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      400
    );
  }
  next();
};

module.exports = validateMiddleware;
