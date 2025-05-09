const { models } = require("../models/index");

const ShadesOfIndelContent = models.ShadesOfIndelContent;

const initShadesOfIndelContent = async () => {
  try {
    const existingContent = await ShadesOfIndelContent.findOne();

    if (existingContent) {
      console.log("Shades of content already exists");
      return;
    }

    await ShadesOfIndelContent.create({
      page_title: "Shades of indel values",
      approach_title: "Shades of indel approach",
    });

    console.log("Shades of content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Shades of content:", error.message);
  }
};

module.exports = { initShadesOfIndelContent };
