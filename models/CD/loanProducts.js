const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CdLoanProducts = sequelize.define(
    "CdLoanProducts",
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
      tableName: "cd_loan_products",
      timestamps: true,
    }
  );

  return CdLoanProducts;
};
