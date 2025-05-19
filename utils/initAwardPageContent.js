const { models } = require("../models/index");

const AwardPageContent = models.AwardPageContent;

const initAwardPageContent = async () => {
  try {
    const existingContent = await AwardPageContent.findOne();

    if (existingContent) {
      console.log("Award Page Content already exists");
      return;
    }

    await AwardPageContent.create({
      meta_title: "Awards Page",
      meta_description: "Discover our prestigious awards and achievements",
      meta_keywords: "awards, achievements, honors",
      title: "Our Awards",
      all_awards_title: "All Our Achievements",
    });

    console.log("Award Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Award Page Content:", error.message);
  }
};

module.exports = { initAwardPageContent };