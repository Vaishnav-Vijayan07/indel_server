const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const IndelValueContent = sequelize.define(
    "IndelValueContent",
    {
      page_title: {
        type: DataTypes.STRING,
        allowNull: false,
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
      approach_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "indel_value_content",
      timestamps: true,
    }
  );

  return IndelValueContent;
};
