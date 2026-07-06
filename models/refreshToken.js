const { DataTypes } = require("sequelize");

/**
 * RefreshToken model
 *
 * Stores hashed refresh tokens; the raw token is only held in the httpOnly
 * cookie and never persisted.  Token rotation is tracked via replacedByTokenHash
 * so replayed/rotated-out tokens can be detected and the full chain revoked.
 *
 * userId is an INTEGER FK that references the Users table (matching user.js
 * which uses DataTypes.INTEGER + autoIncrement).
 */
module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      tokenHash: {
        type: DataTypes.STRING(64),   // SHA-256 hex = 64 chars
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      replacedByTokenHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: null,
      },
      userAgent: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING(45),   // IPv6 max length = 45 chars
        allowNull: true,
      },
    },
    {
      tableName: "refresh_tokens",
      timestamps: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["tokenHash"] },
      ],
    }
  );

  /**
   * Association: RefreshToken belongs to User.
   * Called automatically by models/index.js when it iterates model.associate.
   */
  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return RefreshToken;
};
