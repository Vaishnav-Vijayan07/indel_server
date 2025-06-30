const { models } = require("../models/index");

const EventPageContent = models.EventPageContent;

const initEventPageContent = async () => {
  try {
    const existingContent = await EventPageContent.findOne();

    if (existingContent) {
      
      return;
    }

    await EventPageContent.create({
      meta_title: "Events Page",
      meta_description: "Discover our upcoming and past events",
      meta_keywords: "events, conferences, seminars",
      title: "Our Events",
      slider_title: "Featured Events",
      slider_button_text: "Explore Now",
      slider_button_link: "/events",
      all_events_title: "All Our Events",
    });

    
  } catch (error) {
    console.error("Failed to initialize Event Page Content:", error.message);
  }
};

module.exports = { initEventPageContent };
