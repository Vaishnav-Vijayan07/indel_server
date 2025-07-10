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
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "about_service_galleries",
      timestamps: true,
    }
  );

  return AboutServiceGallery;
};
