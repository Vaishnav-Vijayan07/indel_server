const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ContactFaq = sequelize.define(
    "ContactFaq",
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
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "contact_faqs",
      timestamps: true,
    }
  );

  ContactFaq.associate = (models) => {
    ContactFaq.belongsTo(models.CareerStates, {
      foreignKey: "state_id",
      as: "state",
    });
  };

  return ContactFaq;
};
