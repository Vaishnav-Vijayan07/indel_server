const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TestimonialPageContents = sequelize.define(
    "TestimonialPageContents",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "testimonial_page_contents",
      timestamps: true,
    }
  );

  return TestimonialPageContents;
};
