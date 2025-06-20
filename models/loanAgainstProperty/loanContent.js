const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoanAgainstPropertyContent = sequelize.define(
    "LoanAgainstPropertyContent",
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
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      button_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_offering_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_offering_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      why_loan_against_property_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      why_loan_against_property_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      why_loan_against_property_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      who_do_serve_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_loan_against_property_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_loan_against_property_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      loan_against_property_overview_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loan_against_property_overview_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "loan_against_property_content",
      timestamps: true,
    }
  );

  return LoanAgainstPropertyContent;
};
