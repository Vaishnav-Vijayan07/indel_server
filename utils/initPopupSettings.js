const { models } = require("../models/index");

const PopupSettings = models.PopupSettings;

const initPopupSettings = async () => {
  try {
    const existingSettings = await PopupSettings.findOne();

    if (existingSettings) {
      
      return;
    }

    await PopupSettings.create({
      title: "Welcome",
      sub_title: "Welcome to Indel Money",
      logo: null,
      is_banner: true,
      banner_popup_image: null,
      image_alt:"Alt",
      image_link:"/",
      banner_popup_appearence_time: 5,
      service_popup_appearence_time: 5,
    });

    
  } catch (error) {
    console.error("Failed to initialize Popup settings:", error.message);
  }
};

module.exports = { initPopupSettings };
