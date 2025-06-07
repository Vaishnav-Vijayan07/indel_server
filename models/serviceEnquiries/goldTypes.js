const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldTypes = sequelize.define(
    "GoldTypes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      gold_type_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "gold_types",
      timestamps: true,
    }
  );

  return GoldTypes;
};
