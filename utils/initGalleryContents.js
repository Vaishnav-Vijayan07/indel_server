const { models } = require("../models/index");

const GalleryPageContent = models.GalleryPageContent;

const initGalleryPageContent = async () => {
  try {
    const existingContent = await GalleryPageContent.findOne();

    if (existingContent) {
      
      return;
    }

    await GalleryPageContent.create({
      title: "This is new gallery title",
      description: "This is new gallery description",
      meta_title: "Gallery Page",
      meta_description: "Explore our gallery content",
      meta_keywords: "gallery, images, content",
    });

    
  } catch (error) {
    console.error("Failed to initialize Gallery Page Content:", error.message);
  }
};

module.exports = { initGalleryPageContent };
