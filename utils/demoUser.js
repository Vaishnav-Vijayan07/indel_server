const bcrypt = require("bcrypt");
const { models } = require("../models/index");

const User = models.User;

const createDemoAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { username: "admin" } });

    if (existingAdmin) {
      console.log("Demo admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Demo admin user created: username=admin, password=admin123");
  } catch (error) {
    console.error("Failed to create demo admin user:", error.message);
  }
};

module.exports = { createDemoAdmin };
