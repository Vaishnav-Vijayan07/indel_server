const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Announcement = sequelize.define(
    "Announcement",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "states",
          key: "id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "announcements",
      timestamps: true,
    }
  );

  Announcement.associate = (models) => {
    Announcement.belongsTo(models.CareerStates, {
      foreignKey: "state_id",
      as: "state",
    });
  };

  return Announcement;
};
