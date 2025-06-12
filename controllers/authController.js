const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { models } = require("../models/index");
const CustomError = require("../utils/customError");

const User = models.User;

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password, firstName, lastName, phone, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || "user",
        isActive: true, // Default value, can be omitted since schema sets it
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      console.log("Login attempt with username:", username);

      const user = await User.findOne({
        attributes: ["id", "username", "email", "firstName", "lastName", "phone", "role", "password", "isActive"],
        where: { username },
      });

      if (!user) {
        throw new CustomError("Invalid username or password", 401);
      }

      if (!user.isActive) {
        throw new CustomError("Account is deactivated", 403);
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new CustomError("Invalid username or password", 401);
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const userWithoutPassword = { ...user.toJSON() };
      delete userWithoutPassword.password;

      res.json({ success: true, data: { token, user: userWithoutPassword } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { models } = require("../models/index"); // Import from index.js
// const CustomError = require("../utils/customError");

// const User = models.User; // Access User from models object

// class AuthController {
//   static async register(req, res, next) {
//     try {
//       const { username, password, role } = req.body;
//       const hashedPassword = await bcrypt.hash(password, 10);

//       const user = await User.create({
//         username,
//         password: hashedPassword,
//         role: role || "user",
//       });

//       res.status(201).json({
//         success: true,
//         data: { id: user.id, username: user.username, role: user.role },
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async login(req, res, next) {
//     try {
//       const { username, password } = req.body;

//       console.log("Login attempt with username:", username);
//       console.log("Login attempt with password:", password);

//       const user = await User.findOne({
//         attributes: ["id", "username", "role", "password"],
//         where: { username },
//       });

//       if (!user || !(await bcrypt.compare(password, user.password))) {
//         throw new CustomError("Invalid credentials", 401);
//       }

//       const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
//         expiresIn: "1d",
//       });

//       const userWithoutPassword = { ...user.toJSON() };
//       delete userWithoutPassword.password;

//       res.json({ success: true, data: { token, user: userWithoutPassword } });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = AuthController;
