const bcrypt = require("bcrypt");
const { models } = require("../models/index");

const User = models.User;

const createDemoAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { username: "admin" } });

    if (existingAdmin) {
      
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    
  } catch (error) {
    console.error("Failed to create demo admin user:", error.message);
  }
};

module.exports = { createDemoAdmin };
