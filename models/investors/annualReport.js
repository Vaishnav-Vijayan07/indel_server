const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AnnualReport = sequelize.define(
    "AnnualReport",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "fiscal_years",
          key: "id",
        },
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "annual_report",
      timestamps: true,
    }
  );

  AnnualReport.associate = (models) => {
    AnnualReport.belongsTo(models.FiscalYears, { foreignKey: "year", as: "fiscalYear" });
  };

  return AnnualReport;
};