const { models } = require("../models/index");

const GalleryPageContent = models.GalleryPageContent;

const initGalleryPageContent = async () => {
  try {
    const existingContent = await GalleryPageContent.findOne();

    if (existingContent) {
      console.log("Gallery Page Content already exists");
      return;
    }

    await GalleryPageContent.create({
      title: "This is new gallery title",
      description: "This is new gallery description",
      meta_title: "Gallery Page",
      meta_description: "Explore our gallery content",
      meta_keywords: "gallery, images, content",
    });

    console.log("Gallery Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Gallery Page Content:", error.message);
  }
};

module.exports = { initGalleryPageContent };
