const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoanPopertySupportedIndustries = sequelize.define(
    "  ",
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
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true
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
      tableName: "loan_against_proprty_supported_industries",
      timestamps: true,
    }
  );

  return LoanPopertySupportedIndustries;
};
