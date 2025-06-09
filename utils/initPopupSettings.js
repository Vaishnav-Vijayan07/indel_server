const { models } = require("../models/index");

const PopupSettings = models.PopupSettings;

const initPopupSettings = async () => {
  try {
    const existingSettings = await PopupSettings.findOne();

    if (existingSettings) {
      console.log("Popup settings already exist");
      return;
    }

    await PopupSettings.create({
      title: "Welcome",
      sub_title: "Welcome to Indel Money",
      logo: null,
      is_banner: true,
      banner_popup_image: null,
      banner_popup_appearence_time: 5,
      service_popup_appearence_time: 5,
    });

    console.log("Popup settings initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Popup settings:", error.message);
  }
};

module.exports = { initPopupSettings };
