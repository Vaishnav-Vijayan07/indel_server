const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SocialMediaIcons = sequelize.define(
    "SocialMediaIcons",
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
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon_type: {
        type: DataTypes.ENUM,
        values: ["mobile", "web"],
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "social_media_icons",
      timestamps: true,
    }
  );

  return SocialMediaIcons;
};
