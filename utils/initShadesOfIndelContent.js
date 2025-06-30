const { models } = require("../models/index");

const ShadesOfIndelContent = models.ShadesOfIndelContent;

const initShadesOfIndelContent = async () => {
  try {
    const existingContent = await ShadesOfIndelContent.findOne();

    if (existingContent) {
      
      return;
    }

    await ShadesOfIndelContent.create({
      page_title: "Shades of indel values",
    });

    
  } catch (error) {
    console.error("Failed to initialize Shades of content:", error.message);
  }
};

module.exports = { initShadesOfIndelContent };
