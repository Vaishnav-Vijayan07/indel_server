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
    // Removed: States.hasMany(models.CareerJobs, { foreignKey: "state_id", as: "job_states", });
    States.hasMany(models.HeroBanner, {
      foreignKey: "state_id",
      as: "banners",
    });
    States.hasMany(models.MsmeLoanFaq, {
      foreignKey: "state_id",
      as: "msme_loan_faqs",
    });
    States.hasMany(models.GoldLoanFaq, {
      foreignKey: "state_id",
      as: "gold_loan_faqs",
    });
    States.hasMany(models.ContactFaq, {
      foreignKey: "state_id",
      as: "contact_faqs",
    });
    States.hasMany(models.HomeFaq, {
      foreignKey: "state_id",
      as: "home_faqs",
    });
    States.hasMany(models.Announcement, {
      foreignKey: "state_id",
      as: "announcements",
    });
    States.hasMany(models.Districts, {
      foreignKey: "state_id",
      as: "districts",
    });

    // New many-to-many association with CareerJobs through JobState
    States.belongsToMany(models.CareerJobs, {
      through: models.JobState,
      foreignKey: "state_id",
      otherKey: "job_id",
      as: "jobs", // Alias for the association
    });
  };

  return States;
};

// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const States = sequelize.define(
//     "States",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       state_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       image: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       image_alt: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       order: {
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
//       tableName: "states",
//       timestamps: true,
//     }
//   );

//   States.associate = (models) => {
//     States.hasMany(models.CareerJobs, {
//       foreignKey: "state_id",
//       as: "job_states",
//     });
//     States.hasMany(models.HeroBanner, {
//       foreignKey: "state_id",
//       as: "banners",
//     });
//   };

//   return States;
// };
