const { models } = require("../models/index");

const HistoryPageContent = models.HistoryPageContent;

const initHistoryPageContent = async () => {
  try {
    const existingContent = await HistoryPageContent.findOne();

    if (existingContent) {
      
      return;
    }

    await HistoryPageContent.create({
      page_title: "Our Legacy",
      history_title: "The Journey Begins",
      history_description: "This is a default history description of our organization.",
      inception_title: "Inception Era",
    });

    
  } catch (error) {
    console.error("Failed to initialize History Page Content:", error.message);
  }
};

module.exports = { initHistoryPageContent };
