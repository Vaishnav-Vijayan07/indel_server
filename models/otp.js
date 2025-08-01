const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Otp = sequelize.define(
    "Otp",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "otps",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return Otp;
};
