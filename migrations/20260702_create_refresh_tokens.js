"use strict";

/**
 * Migration: create_refresh_tokens_table
 *
 * Run:  node migrations/20260702_create_refresh_tokens.js
 *
 * This is a standalone migration script (no Sequelize CLI dependency).
 * It uses the same sequelize instance used by the app so DATABASE_URL is
 * read from .env automatically.
 */

const { DataTypes, QueryInterface } = require("sequelize");
const sequelize = require("../config/database");
require("dotenv").config();

const queryInterface = sequelize.getQueryInterface();

const TABLE = "refresh_tokens";

async function up() {
  const tableExists = await queryInterface
    .showAllTables()
    .then((tables) => tables.includes(TABLE));

  if (tableExists) {
    console.log(`Table "${TABLE}" already exists — skipping creation.`);
    return;
  }

  await queryInterface.createTable(TABLE, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "tokenHash",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expiresAt",
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "revokedAt",
    },
    replacedByTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      defaultValue: null,
      field: "replacedByTokenHash",
    },
    userAgent: {
      type: DataTypes.STRING(512),
      allowNull: true,
      field: "userAgent",
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: "ip",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "createdAt",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updatedAt",
    },
  });

  // Index on userId for fast per-user lookups
  await queryInterface.addIndex(TABLE, ["userId"], {
    name: "idx_refresh_tokens_user_id",
  });

  // Index on tokenHash for fast token lookups
  await queryInterface.addIndex(TABLE, ["tokenHash"], {
    name: "idx_refresh_tokens_token_hash",
  });

  console.log(`Table "${TABLE}" created with indexes.`);
}

async function down() {
  await queryInterface.dropTable(TABLE);
  console.log(`Table "${TABLE}" dropped.`);
}

// ── Entry point ──────────────────────────────────────────────────────────────
const command = process.argv[2]; // "up" | "down"

(async () => {
  try {
    await sequelize.authenticate();
    if (command === "down") {
      await down();
    } else {
      await up();
    }
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
