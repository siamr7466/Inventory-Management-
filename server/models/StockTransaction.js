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
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

StockTransaction.belongsTo(Product);
StockTransaction.belongsTo(User);

module.exports = StockTransaction;
