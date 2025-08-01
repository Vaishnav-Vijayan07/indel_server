const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanScheme = sequelize.define(
    "GoldLoanScheme",
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
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      tableName: "gold_loan_scheme",
      timestamps: true,
    }
  );

  GoldLoanScheme.associate = function (models) {
    GoldLoanScheme.hasMany(models.SchemeDetails, {
      foreignKey: "scheme_id",
      as: "scheme_details",
    });
  };

  return GoldLoanScheme;
};
