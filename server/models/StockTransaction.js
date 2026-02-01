const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Product = require('./Product');
const User = require('./User');

const StockTransaction = sequelize.define('StockTransaction', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('IN', 'OUT'),
        allowNull: false
    },
    unitPrice: { // The price at which the transaction occurred (cost for IN, sale for OUT)
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    costPriceAtTime: { // The cost price of the product at the time of the transaction (for profit calculation)
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});


module.exports = StockTransaction;
