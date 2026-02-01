const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SalesTarget = sequelize.define('SalesTarget', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER, // 1-12
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    targetUnits: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    targetValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    }
});

module.exports = SalesTarget;
