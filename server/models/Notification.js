const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Notification = sequelize.define('Notification', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'DANGER'),
        defaultValue: 'INFO'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    link: {
        type: DataTypes.STRING, // Optional link to redirect user
        allowNull: true
    }
});

module.exports = Notification;
