const sequelize = require('../database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const StockTransaction = require('./StockTransaction');
const ApprovalRequest = require('./ApprovalRequest');
const SalesTarget = require('./SalesTarget');
const Notification = require('./Notification');

// Associations
Product.belongsTo(Category, { foreignKey: 'CategoryId', as: 'Category' });
Category.hasMany(Product, { foreignKey: 'CategoryId', as: 'Products' });

StockTransaction.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(StockTransaction, { foreignKey: 'productId', as: 'StockTransactions' });

StockTransaction.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(StockTransaction, { foreignKey: 'userId', as: 'StockTransactions' });

ApprovalRequest.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(ApprovalRequest, { foreignKey: 'productId', as: 'ApprovalRequests' });

ApprovalRequest.belongsTo(User, { foreignKey: 'RequesterId', as: 'Requester' });
User.hasMany(ApprovalRequest, { foreignKey: 'RequesterId', as: 'Requests' });

SalesTarget.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(SalesTarget, { foreignKey: 'userId', as: 'SalesTargets' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'Notifications' });

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    StockTransaction,
    ApprovalRequest,
    SalesTarget,
    Notification
};
