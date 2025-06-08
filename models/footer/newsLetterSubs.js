const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NewsLetterSubs = sequelize.define(
    "NewsLetterSubs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      browser_info: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "news_letter_subs",
      timestamps: true,
    }
  );

  return NewsLetterSubs;
};
