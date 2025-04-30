const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutServiceGallery = sequelize.define(
    "AboutServiceGallery",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "about_service_galleries",
      timestamps: true,
    }
  );

  return AboutServiceGallery;
};
