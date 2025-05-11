const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MsmeTargetedAudience = sequelize.define(
    "MsmeTargetedAudience",
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
      image: {
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
      tableName: "msme_targeted_audience",
      timestamps: true,
    }
  );

  return MsmeTargetedAudience;
};
