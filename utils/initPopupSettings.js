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
      title: "Welcome to Indel Money",
      sub_title: "Welcome to Indel Money",
      logo: null,
      banner_popup_status: false,
      service_popup_status: false,
      banner_popup_image: null,
      banner_popup_appearence_time: 5,
      banner_popup_disappear_time: 10,
      service_popup_appearence_time: 5,
      service_popup_disappear_time: 8,
    });

    console.log("Popup settings initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Popup settings:", error.message);
  }
};

module.exports = { initPopupSettings };
