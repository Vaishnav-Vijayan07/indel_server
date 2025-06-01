const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutAccolades = sequelize.define(
    "AboutAccolades",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bold_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      highlight_image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      highlight_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "about_accolades",
      timestamps: true,
    }
  );

  return AboutAccolades;
};
