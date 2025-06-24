const { models } = require("../models/index");

const ServicesPageContent = models.ServiceContent;

const initServicesPageContent = async () => {
  try {
    const existingContent = await ServicesPageContent.findOne();

    if (existingContent) {
      console.log("Services Page Content already exists");
      return;
    }

    await ServicesPageContent.create({
      page_super_title: "Explore Our Services",
      page_title: "How We Help You",
      deals_title: "Best Forex Deals",
      deals_description: "We offer competitive exchange rates with minimal service charges to ensure maximum value.",
      remit_section_title: "Remit Money with Ease",
      remit_section_description: "Our platform makes sending money overseas secure, fast, and cost-effective.",
      image: null,
      remit_section_button_title: "Start Remittance",
      remit_section_button_link: "https://example.com/remittance",
    });

    console.log("Services Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Services Page Content:", error.message);
  }
};

module.exports = { initServicesPageContent };
