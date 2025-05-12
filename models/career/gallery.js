const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CareerGallery = sequelize.define(
    "CareerGallery",
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
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "career_gallery",
      timestamps: true,
    }
  );

  return CareerGallery;
};
