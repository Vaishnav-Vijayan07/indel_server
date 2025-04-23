const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new CustomError("Authentication token required", 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        throw new CustomError("Insufficient permissions", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authMiddleware;
