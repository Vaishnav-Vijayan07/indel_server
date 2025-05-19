const { models } = require("../models/index");

const EventPageContent = models.EventPageContent;

const initEventPageContent = async () => {
  try {
    const existingContent = await EventPageContent.findOne();

    if (existingContent) {
      console.log("Event Page Content already exists");
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

    console.log("Event Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Event Page Content:", error.message);
  }
};

module.exports = { initEventPageContent };
