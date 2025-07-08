const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Jobs = sequelize.define(
    "Jobs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      job_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "states",
          key: "id",
        },
      },
      job_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      key_responsibility: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "jobs",
      timestamps: true,
    }
  );

  Jobs.associate = (models) => {
    Jobs.belongsTo(models.CareerRoles, {
      foreignKey: "role_id",
      as: "role",
    });
    Jobs.belongsTo(models.CareerLocations, {
      foreignKey: "location_id",
      as: "location",
    });
    Jobs.belongsTo(models.CareerStates, {
      foreignKey: "state_id",
      as: "state",
    });
  };

  return Jobs;
};
