const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const loanAgainstPropertyOfferings = sequelize.define(
    "loanAgainstPropertyOfferings",
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
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "loan_against_property_offerings",
      timestamps: true,
    }
  );

  return loanAgainstPropertyOfferings;
};
