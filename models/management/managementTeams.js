const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ManagementTeams = sequelize.define(
    "ManagementTeams",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "management_teams",
      timestamps: true,
    }
  );

  return ManagementTeams;
};
