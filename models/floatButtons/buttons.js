const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FloatButtons = sequelize.define(
    "FloatButtons",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
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
      tableName: "float_buttons",
      timestamps: true,
    }
  );

  return FloatButtons;
};
