const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Roles = sequelize.define(
    "Roles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "roles",
      timestamps: true,
    }
  );

  Roles.associate = (models) => {
    Roles.hasMany(models.CareerJobs, {
      foreignKey: "role_id",
      as: "job_roles",
    });
  };

   Roles.associate = (models) => {
    Roles.hasMany(models.JobApplications, {
      foreignKey: "preferred_role",
      as: "preferredRole",
    });
  };



  return Roles;
};
