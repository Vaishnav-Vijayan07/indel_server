const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const QuarterlyReports = sequelize.define(
        "QuarterlyReports",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true
            },
            year: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "fiscal_years",
                    key: "id",
                },
            },
            file: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "quarterly_reports",
            timestamps: true,
        }
    );

    QuarterlyReports.associate = (models) => {
        QuarterlyReports.belongsTo(models.FiscalYears, { foreignKey: "year", as: "fiscalYear" });
    };

    return QuarterlyReports;
};
