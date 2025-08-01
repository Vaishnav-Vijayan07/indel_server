const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CareerPageMeta = sequelize.define(
    "CareerPageMeta",
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
      type: {
        type: DataTypes.ENUM,
        values: ["career", "listings"],
        allowNull: false,
      },
    },
    {
      tableName: "career_page_meta",
      timestamps: true,
    }
  );

  return CareerPageMeta;
};
