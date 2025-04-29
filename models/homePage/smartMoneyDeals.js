const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SmartMoneyDeals = sequelize.define(
    "SmartMoneyDeals",
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
        allowNull: false,
      },
    },
    {
      tableName: "smart_money_deals",
      timestamps: true,
    }
  );

  return SmartMoneyDeals;
};
