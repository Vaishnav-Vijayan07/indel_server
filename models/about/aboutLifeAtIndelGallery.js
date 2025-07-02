const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutLifeAtIndelGallery = sequelize.define(
    "AboutLifeAtIndelGallery",
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
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "about_life_at_indel_galleries",
      timestamps: true,
    }
  );

  return AboutLifeAtIndelGallery;
};
