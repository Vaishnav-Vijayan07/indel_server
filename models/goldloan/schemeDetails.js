const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanSchemeDetails = sequelize.define(
    "GoldLoanSchemeDetails",
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
      value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      scheme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "gold_loan_scheme",
          key: "id",
        },
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
      tableName: "gold_loan_scheme_details",
      timestamps: true,
    }
  );

  GoldLoanSchemeDetails.associate = (models) => {
    GoldLoanSchemeDetails.belongsTo(models.GoldLoanScheme, {
      foreignKey: "scheme_id",
      as: "goldLoanScheme",
    });
  };

  return GoldLoanSchemeDetails;
};
