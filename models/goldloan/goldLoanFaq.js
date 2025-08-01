const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanFaqs = sequelize.define(
    "GoldLoanFaqs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "states",
          key: "id",
        },
      },
    },
    {
      tableName: "gold_loan_faqs",
      timestamps: true,
    }
  );
  GoldLoanFaqs.associate = (models) => {
    GoldLoanFaqs.belongsTo(models.CareerStates, {
      foreignKey: "state_id",
      as: "state",
    });
  };

  return GoldLoanFaqs;
};
