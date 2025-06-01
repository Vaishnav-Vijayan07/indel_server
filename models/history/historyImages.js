const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HistoryImages = sequelize.define(
    "HistoryImages",
    {
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
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "history_images",
      timestamps: true,
    }
  );

  return HistoryImages;
};
