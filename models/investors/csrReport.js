const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CsrReport = sequelize.define(
    "CsrReport",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fiscal_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "fiscal_years",
          key: "id",
        },
      },
      report: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "csr_report",
      timestamps: true,
    }
  );

  CsrReport.associate = (models) => {
    CsrReport.belongsTo(models.FiscalYears, { foreignKey: "fiscal_year", as: "fiscalYear" });
  };

  return CsrReport;
};
