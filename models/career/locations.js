const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Locations = sequelize.define(
    "Locations",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      location_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "districts",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
      tableName: "locations",
      timestamps: true,
    }
  );

  Locations.associate = (models) => {
    // Removed: Locations.hasMany(models.CareerJobs, { foreignKey: "location_id", as: "job_locations", });
    // Removed: Locations.hasMany(models.JobApplications, { foreignKey: "location", as: "job_applications", });

    // New many-to-many association with CareerJobs through JobLocation
    Locations.belongsToMany(models.CareerJobs, {
      through: models.JobLocation,
      foreignKey: "location_id",
      otherKey: "job_id",
      as: "jobs", // Alias for the association
    });
  };

  return Locations;
};

// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Locations = sequelize.define(
//     "Locations",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       location_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       district_id: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: "districts",
//           key: "id",
//         },
//         onDelete: "CASCADE",
//         onUpdate: "CASCADE",
//       },
//       order:{
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       is_active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true,
//       },
//     },
//     {
//       tableName: "locations",
//       timestamps: true,
//     }
//   );

//   Locations.associate = (models) => {
//     Locations.hasMany(models.CareerJobs, {
//       foreignKey: "location_id",
//       as: "job_locations",
//     });
//   };

//   Locations.associate = (models) => {
//     Locations.hasMany(models.JobApplications, {
//       foreignKey: "location",
//       as: "job_applications",
//     });
//   };

//   return Locations;
// };
