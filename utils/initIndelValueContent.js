const { models } = require("../models/index");

const IndelValueContent = models.IndelValueContent;

const initIndelValueContent = async () => {
  try {
    const existingContent = await IndelValueContent.findOne();

    if (existingContent) {
      
      return;
    }

    await IndelValueContent.create({
      page_title:"Our Values",
      approach_title:"Our Approach",
    });

    
  } catch (error) {
    console.error("Failed to initialize Indel Value Content:", error.message);
  }
};

module.exports = { initIndelValueContent };
