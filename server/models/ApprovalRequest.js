const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Product = require('./Product');
const User = require('./User');

const ApprovalRequest = sequelize.define('ApprovalRequest', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('IN', 'OUT'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
    }
});

ApprovalRequest.belongsTo(Product);
ApprovalRequest.belongsTo(User, { as: 'Requester' });

module.exports = ApprovalRequest;
