const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoanAgainstPropertyTypes = sequelize.define(
    "LoanAgainstPropertyTypes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "loan_against_property_types",
      timestamps: true,
    }
  );

  return LoanAgainstPropertyTypes;
};
