const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    modelName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    currentStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('Available', 'Low Stock', 'Out of Stock'),
        defaultValue: 'Out of Stock'
    },
    barcode: {
        type: DataTypes.STRING,
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

Product.belongsTo(Category);
Category.hasMany(Product);

module.exports = Product;
