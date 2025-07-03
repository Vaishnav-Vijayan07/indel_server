const { models } = require("../models/index");

const DirectorsContent = models.DirectorsContent;

const initDirectorsContent = async () => {
  try {
    const existingContent = await DirectorsContent.findOne();

    if (existingContent) {
      
      return;
    }

    await DirectorsContent.create({
      title : "This is new directors",
      description : "This is new  directors",
    });

    
  } catch (error) {
    console.error("Failed to initialize Directors Content:", error.message);
  }
};

module.exports = { initDirectorsContent };
