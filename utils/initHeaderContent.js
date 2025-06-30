const { models } = require("../models/index");

const HeaderContents = models.HeaderContents;

const initHeaderContents = async () => {
  try {
    const existingContent = await HeaderContents.findOne();

    if (existingContent) {
      console.log("Header content already exists");
      return;
    }

    await HeaderContents.create({
      logo: null,
      button_1_text: "Get Started",
      button_1_inner_title: "Apply Now",
      button_2_link: "https://indelmoney.com/contact",
      button_2_text: "Contact Us",
      apple_dowload_icon: null,
      andrioid_download_icon: null,
      apple_dowload_link: "https://www.apple.com/app-store/",
      andrioid_download_link: "https://play.google.com/store",
    });

    console.log("Header content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Header content:", error.message);
  }
};

module.exports = { initHeaderContents };
