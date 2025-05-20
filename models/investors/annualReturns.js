const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AnnualReturns = sequelize.define(
    "AnnualReturns",
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
      tableName: "annual_returns",
      timestamps: true,
    }
  );

  AnnualReturns.associate = (models) => {
    AnnualReturns.belongsTo(models.FiscalYears, { foreignKey: "year", as: "fiscalYear" });
  };

  return AnnualReturns;
};
