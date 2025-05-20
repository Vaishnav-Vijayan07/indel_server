const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OtherIntimations = sequelize.define(
    "OtherIntimations",
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
      month_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      record_date_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interest_payment_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "other_intimations",
      timestamps: true,
    }
  );

  OtherIntimations.associate = (models) => {
    OtherIntimations.belongsTo(models.FiscalYears, { foreignKey: "fiscal_year", as: "fiscalYear" });
  };

  return OtherIntimations;
};
