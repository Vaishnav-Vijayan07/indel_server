const { models } = require("../models/index");

const FooterContent = models.FooterContent;

const initFooterContent = async () => {
  try {
    const existingContent = await FooterContent.findOne();

    if (existingContent) {
      console.log("Footer content already exists");
      return;
    }

    await FooterContent.create({
      title: "Indel Money",
      logo: null,
      news_letter_title: "Subscribe to Indels Newsletter",
      address: "123 Indel Street, Financial City, FC 12345",
      toll_free_num: "+18001234567",
      email: "contact@indelmoney.com",
      button_1_text: "Contact Us",
      button_1_link: "https://indelmoney.com/contact",
      button_2_text: "Learn More",
      button_2_link: "https://indelmoney.com/about",
      icon_section_link: "https://indelmoney.com/services",
      icon_section_text: "Explore Our Services",
      social_media_text: "Follow Us on Social Media",
    });

    console.log("Footer content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Footer content:", error.message);
  }
};

module.exports = { initFooterContent };
