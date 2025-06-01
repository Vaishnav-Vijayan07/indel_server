const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventGallery = sequelize.define(
    "EventGallery",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      video: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_video: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      event_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "event_types",
          key: "id",
        },
      },
    },
    {
      tableName: "event_gallery",
      timestamps: true,
    }
  );

  EventGallery.associate = (models) => {
    EventGallery.belongsTo(models.EventTypes, {
      foreignKey: "event_type_id",
      as: "eventType",
    });
  };

  return EventGallery;
};
