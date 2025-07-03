const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HeroBanner = sequelize.define(
    "HeroBanner",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      button_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      button_link: {
        type: DataTypes.STRING,
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
      banner_type: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ["mobile", "web"],
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "hero_banners",
      timestamps: true,
    }
  );

  HeroBanner.associate = (models) => {
    HeroBanner.belongsTo(models.CareerStates, {
      foreignKey: "state_id",
      as: "state",
    });
  };

  return HeroBanner;
};
