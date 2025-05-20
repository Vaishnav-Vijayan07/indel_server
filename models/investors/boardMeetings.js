const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BoardMeetings = sequelize.define(
    "BoardMeetings",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fiscal_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "fiscal_years",
          key: "id",
        },
      },
      meeting_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      intimation_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      outcome_document: {
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
      tableName: "board_meetings",
      timestamps: true,
    }
  );

  BoardMeetings.associate = (models) => {
    BoardMeetings.belongsTo(models.FiscalYears, { foreignKey: "fiscal_year", as: "fiscalYear" });
  };

  return BoardMeetings;
};