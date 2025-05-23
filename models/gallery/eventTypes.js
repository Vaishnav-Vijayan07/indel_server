const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventTypes = sequelize.define(
    "EventTypes",
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
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_slider: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "event_types",
      timestamps: true,
    }
  );

  EventTypes.associate = (models) => {
    EventTypes.hasMany(models.EventGallery, {
      foreignKey: "event_type_id",
      as: "galleryItems",
    });
  };

  return EventTypes;
};

// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const EventTypes = sequelize.define(
//     "EventTypes",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//       },
//       order: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       is_slider: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//       },
//       is_active: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true,
//       },
//     },
//     {
//       tableName: "event_types",
//       timestamps: true,
//     }
//   );

//   return EventTypes;
// };
