const { models } = require("../models/index");

const LoanAgainstPropertyContent = models.LapContent;

const initLoanAgainstPropertyContent = async () => {
  try {
    const existingContent = await LoanAgainstPropertyContent.findOne();

    if (existingContent) {
      console.log("Loan Against Property Page Content already exists");
      return;
    }

    await LoanAgainstPropertyContent.create({
      page_title: "Loan Against <span>Property</span>",
      meta_title: "Loan Against Property - Quick and Reliable",
      meta_description: "Explore our LAP offerings with attractive terms and fast approval.",
      meta_keywords: "cd loan, loan against cd, quick loan",
      loan_offer_title: "Exclusive LAP <span>Loan</span> Offer",
      loan_offer_description: "Avail loans against your certificate of deposit with ease.",
      loan_offer_button_text: "Apply Now",
      loan_offer_button_link: "https://example.com/apply",
      image: null,
      title_image_alt: "LAP Loan Services",
      eligibility_criteria_image_alt: "Eligibility Criteria",
      covered_products_section_image_alt: "Covered Products",
      feature_image_alt: "Key Features of CD Loan",

      covered_products_section_title: "<span>Products</span>",
      covered_products_section_image: null,
      eligibility_criteria_icon: null,
      eligibility_criteria_title: "Eligibility <span>Criteria</span>",
      eligibility_criteria_description: "Must hold a valid certificate of deposit with our institution.",
      eligibility_criteria_note: "Terms and conditions apply.",
      feature_title: "Key Features of <span>CD Loan</span>",
      feature_image: null,
    });

    console.log("Loan Against Property Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Loan Against Property Content:", error.message);
  }
};

module.exports = { initLoanAgainstPropertyContent };
