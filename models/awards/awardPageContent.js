const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AwardPageContent = sequelize.define(
    "AwardPageContent",
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      all_awards_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "award_page_content",
      timestamps: true,
    }
  );

  return AwardPageContent;
};