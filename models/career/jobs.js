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
        allowNull: true,
        references: {
          model: "roles",
          key: "id",
        },
      },
      job_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      job_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      experience: {
        type: DataTypes.STRING,
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
    
    // Add many-to-many associations
    Jobs.belongsToMany(models.CareerLocations, {
      through: models.JobLocations,
      foreignKey: "job_id",
      otherKey: "location_id",
      as: "locations",
    });
    Jobs.belongsToMany(models.CareerStates, {
      through: models.JobStates,
      foreignKey: "job_id",
      otherKey: "state_id",
      as: "states",
    });
  };

  return Jobs;
};
