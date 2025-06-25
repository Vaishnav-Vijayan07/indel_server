const { models } = require("../models/index");

const InvestorsPageContent = models.InvestorsPageContent;

const initInvestorsPageContent = async () => {
  try {
    const existingContent = await InvestorsPageContent.findOne();

    if (existingContent) {
      console.log("Investors Page Content already exists");
      return;
    }

    await InvestorsPageContent.create({
      meta_title: "Investors Page",
      meta_description: "Explore our investor resources and financial information",
      meta_keywords: "investors, financials, annual reports, governance",
      page_title: "Investor Relations",
      annual_report_title: "Annual Reports",
      annual_returns_title: "Annual Returns",
      investors_contact_title: "Contact Investor Relations",
      credit_rating_title: "Credits",
      quarterly_results_title: "Quarterlys",
      policies_title: "Policies",
      stock_exchange_title: "Stock Exchange Filings",
      corporate_governance_title: "Corporate Governance",
      disclosure_title: "Disclosures",
      disclosure_file: null,
    });

    console.log("Investors Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Investors Page Content:", error.message);
  }
};

module.exports = { initInvestorsPageContent };
