const { models } = require("../models/index");

const DirectorsContent = models.DirectorsContent;

const initDirectorsContent = async () => {
  try {
    const existingContent = await DirectorsContent.findOne();

    if (existingContent) {
      console.log("Directors Content already exists");
      return;
    }

    await DirectorsContent.create({
      title : "This is new directors",
      description : "This is new  directors",
    });

    console.log("Directors Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Directors Content:", error.message);
  }
};

module.exports = { initDirectorsContent };
