const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NcdPageContent = sequelize.define(
    "NcdPageContent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.TEXT,
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
      banner_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      second_banner_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      second_banner_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "ncd_page_content",
      timestamps: true,
    }
  );

  return NcdPageContent;
};
