const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ServicesPageContent = sequelize.define(
    "ServicesPageContent",
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
      banner_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_super_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deals_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deals_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gold_loan_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gold_title_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gold_loan_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gold_loan_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      benfits_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remit_section_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remit_section_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remit_section_button_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remit_section_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "services_page_content",
      timestamps: true,
    }
  );

  return ServicesPageContent;
};
