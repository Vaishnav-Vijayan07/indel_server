const { models } = require("../models/index");

const AwardPageContent = models.AwardPageContent;

const initAwardPageContent = async () => {
  try {
    const existingContent = await AwardPageContent.findOne();

    if (existingContent) {
      
      return;
    }

    await AwardPageContent.create({
      meta_title: "Awards Page",
      meta_description: "Discover our prestigious awards and achievements",
      meta_keywords: "awards, achievements, honors",
      title: "Our Awards",
      all_awards_title: "All Our Achievements",
    });

    
  } catch (error) {
    console.error("Failed to initialize Award Page Content:", error.message);
  }
};

module.exports = { initAwardPageContent };