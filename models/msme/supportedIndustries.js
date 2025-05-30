const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MsmeLoanSupportedIndustries = sequelize.define(
    "MsmeLoanSupportedIndustries",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "msme_loan_supported_industries",
      timestamps: true,
    }
  );

  return MsmeLoanSupportedIndustries;
};
