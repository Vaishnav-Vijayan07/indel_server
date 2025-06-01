const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutQuickLinks = sequelize.define(
    "AboutQuickLinks",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true
      },
      button_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      button_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "about_quick_links",
      timestamps: true,
    }
  );

  return AboutQuickLinks;
};
