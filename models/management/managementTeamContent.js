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
