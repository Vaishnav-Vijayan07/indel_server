const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HistoryInceptionsYears = sequelize.define(
    "HistoryInceptionsYears",
    {
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "history_inceptions_years",
      timestamps: true,
    }
  );

  return HistoryInceptionsYears;
};
