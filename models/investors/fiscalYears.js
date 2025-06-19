const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FiscalYears = sequelize.define(
    "FiscalYears",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fiscal_year: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "fiscal_years",
      timestamps: true,
    }
  );

  return FiscalYears;
};
