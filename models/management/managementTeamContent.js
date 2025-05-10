const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ManagementTeamContent = sequelize.define(
    "ManagementTeamContent",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "management_team_contents",
      timestamps: true,
    }
  );

  return ManagementTeamContent;
};
