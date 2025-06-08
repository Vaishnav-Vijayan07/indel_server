const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PaymentModes = sequelize.define(
    "PaymentModes",
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
      tableName: "payment_modes",
      timestamps: true,
    }
  );

  return PaymentModes;
};
