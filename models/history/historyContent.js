const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HistoryPageContent = sequelize.define(
    "HistoryPageContent",
    {
      page_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      history_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      history_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      inception_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "history_page_content",
      timestamps: true,
    }
  );

  return HistoryPageContent;
};
