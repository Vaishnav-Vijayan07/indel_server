const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestorsPageContent = sequelize.define(
    "InvestorsPageContent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      annual_report_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      annual_report_button_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      annual_returns_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investors_contact_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      policies_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stock_exchange_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      corporate_governance_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disclosure_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disclosure_file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      csr_committee_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      csr_reports_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      csr_action_plan_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      csr_policy_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      csr_policy_doc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ncd_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "investors_page_content",
      timestamps: true,
    }
  );

  return InvestorsPageContent;
};
