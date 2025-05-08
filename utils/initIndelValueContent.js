const { models } = require("../models/index");

const IndelValueContent = models.IndelValueContent;

const initIndelValueContent = async () => {
  try {
    const existingContent = await IndelValueContent.findOne();

    if (existingContent) {
      console.log("Indel Value Content already exists");
      return;
    }

    await IndelValueContent.create({
      page_title:"Our Values",
      approach_title:"Our Approach",
    });

    console.log("Indel Value Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Indel Value Content:", error.message);
  }
};

module.exports = { initIndelValueContent };
