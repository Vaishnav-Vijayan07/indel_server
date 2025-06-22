const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Branches = sequelize.define(
    "Branches",
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
      branch_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "states",
          key: "id",
        },
      },
      district: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "districts",
          key: "id",
        },
      },
      location: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      phone_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "branches",
      timestamps: true,
    }
  );

  Branches.associate = (models) => {
    Branches.belongsTo(models.CareerStates, {
      foreignKey: "state",
      as: "states",
    });

    Branches.belongsTo(models.Districts, {
      foreignKey: "district",
      as: "districts",
    });
    Branches.belongsTo(models.CareerLocations, {
      foreignKey: "location",
      as: "locations",
    });
  };

  return Branches;
};
