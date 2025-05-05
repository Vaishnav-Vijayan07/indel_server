const { models } = require("../models/index");

const DebtPartnersContent = models.DebtPartnersContent;

const initDebtPartnersContent = async () => {
  try {
    const existingContent = await DebtPartnersContent.findOne();

    if (existingContent) {
      console.log("Debt partners Content already exists");
      return;
    }

    await DebtPartnersContent.create({
      title: "This is new title",
      super_title: "This is new super title",
    });

    console.log("Debt partners content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize debt partners Content:", error.message);
  }
};

module.exports = { initDebtPartnersContent };
