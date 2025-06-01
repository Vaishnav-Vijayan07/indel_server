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
      page_super_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      page_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deals_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deals_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      remit_section_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remit_section_description: {
        type: DataTypes.TEXT,
        allowNull: false,
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
        allowNull: false,
      },
      remit_section_button_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "services_page_content",
      timestamps: true,
    }
  );

  return ServicesPageContent;
};
