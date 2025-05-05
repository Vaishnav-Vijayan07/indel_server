const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeptPartners = sequelize.define(
    "DeptPartners",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "debt_partners",
      timestamps: true,
    }
  );

  return DeptPartners;
};
