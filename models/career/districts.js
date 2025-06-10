const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const District = sequelize.define(
        "District",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            district_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            state_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "states",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "districts",
            timestamps: true,
        }
    );

    District.associate = (models) => {
        District.belongsTo(models.CareerStates, {
            foreignKey: "state_id",
            as: "state",
        });
    };

    return District;
};
