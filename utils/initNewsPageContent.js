const { models } = require("../models/index");

const NewsPageContent = models.NewsPageContent;

const initNewsPageContent = async () => {
  try {
    const existingContent = await NewsPageContent.findOne();

    if (existingContent) {
      
      return;
    }

    await NewsPageContent.create({
      meta_title: "News Page",
      meta_description: "Stay updated with our latest news and announcements",
      meta_keywords: "news, updates, announcements",
      title: "Latest News",
      slider_title: "Breaking News",
      slider_button_text: "Read More",
      slider_button_link: "/news",
      all_news_title: "All Our News",
    });

    
  } catch (error) {
    console.error("Failed to initialize News Page Content:", error.message);
  }
};

module.exports = { initNewsPageContent };