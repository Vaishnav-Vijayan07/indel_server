const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoanAgainstPropertyFaq = sequelize.define(
    "LoanAgainstPropertyFaq",
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
      tableName: "loan_against_property_faqs",
      timestamps: true,
    }
  );

  LoanAgainstPropertyFaq.associate = (models) => {
    LoanAgainstPropertyFaq.belongsTo(models.CareerStates, {
      foreignKey: "state_id",
      as: "state",
    });
  };

  return LoanAgainstPropertyFaq;
};
