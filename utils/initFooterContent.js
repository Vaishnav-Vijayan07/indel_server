const { models } = require("../models/index");

const FooterContent = models.FooterContent;

const initFooterContent = async () => {
  try {
    const existingContent = await FooterContent.findOne();

    if (existingContent) {
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
      branch_locator_link: "https://indelmoney.com/branch-locator",
      branch_locator_icon_mobile: null,
      branch_locator_icon_web: null,
      toll_free_icon_mobile: null,
      toll_free_icon_web: null,
      social_media_text: "Follow Us on Social Media",
    });
  } catch (error) {
    console.error("Failed to initialize Footer content:", error.message);
  }
};

module.exports = { initFooterContent };
