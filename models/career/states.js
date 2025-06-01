const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const States = sequelize.define(
    "States",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      state_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
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
      tableName: "states",
      timestamps: true,
    }
  );

  States.associate = (models) => {
    States.hasMany(models.CareerJobs, {
      foreignKey: "state_id",
      as: "job_states",
    });
  };

  return States;
};
