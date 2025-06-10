const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Directors = sequelize.define(
    "Directors",
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "directors",
      timestamps: true,
    }
  );

  return Directors;
};
