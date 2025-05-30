const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventPageContent = sequelize.define(
    "EventPageContent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slider_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slider_button_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slider_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      all_events_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "event_page_content",
      timestamps: true,
    }
  );

  return EventPageContent;
};