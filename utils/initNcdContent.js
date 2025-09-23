const { models } = require("../models/index");

const NcdPageContent = models.NcdPageContent;

const initNcdPageContent = async () => {
  try {
    const existingContent = await NcdPageContent.findOne();

    if (existingContent) {
      return;
    }

    await NcdPageContent.create({
      meta_title: "National Career Program - Empowering Futures",
      meta_description:
        "Learn about the National Career Program (NCD), empowering students and professionals through career guidance, training, and opportunities.",
      meta_keywords: "NCD, Career, Education, Training, Jobs, Guidance",
      banner_image: null,
      banner_image_alt: "National Career Program Banner",
      content:
        "The National Career Program (NCD) is an initiative aimed at providing career opportunities, guidance, and resources to students and professionals across India. Our mission is to bridge the gap between talent and opportunities through structured training and placement programs.",
      second_banner_image: null,
      second_banner_image_alt: "Students attending NCD training program",
    });

  } catch (error) {
    console.error("Failed to initialize NCD Page Content:", error.message);
  }
};

module.exports = { initNcdPageContent };
