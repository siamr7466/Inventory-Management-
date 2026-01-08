const sequelize = require('../database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const StockTransaction = require('./StockTransaction');
const ApprovalRequest = require('./ApprovalRequest');

// Associations are defined in the individual files, but good to have a central load if needed.
// Actually, I put them in the individual files, but they need to be loaded to trigger.

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    StockTransaction,
    ApprovalRequest
};
