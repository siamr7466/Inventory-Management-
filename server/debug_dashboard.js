const { Product, StockTransaction, SalesTarget, ApprovalRequest, sequelize } = require('./models');
const { Op } = require('sequelize');

async function debugDashboard() {
    try {
        const isAdmin = true;
        const userId = 1;
        const range = '7d';

        // MOCK REQUEST LOGIC
        const totalProducts = await Product.count();
        const products = await Product.findAll();
        const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
        const stockValue = products.reduce((acc, p) => acc + (p.currentStock * p.price), 0);
        const inventoryCostValue = products.reduce((acc, p) => acc + (p.currentStock * (p.costPrice || 0)), 0);

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const pendingApprovals = await ApprovalRequest.count({ where: { status: 'PENDING' } });

        const stockStatus = {
            Available: products.filter(p => p.status === 'Available').length,
            LowStock: products.filter(p => p.status === 'Low Stock').length,
            OutOfStock: products.filter(p => p.status === 'Out of Stock').length,
        };

        const today = new Date();
        let startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const txWhere = { date: { [Op.gte]: startDate } };

        const transactions = await StockTransaction.findAll({
            where: txWhere,
            include: [{ model: Product, as: 'Product' }],
            order: [['date', 'ASC']]
        });

        let rangeRevenue = 0;
        let rangeCOGS = 0;
        let rangeInvestment = 0;
        let rangeUnitsSold = 0;

        transactions.forEach(t => {
            if (t.type === 'OUT') {
                rangeRevenue += (t.quantity * t.unitPrice);
                rangeCOGS += (t.quantity * t.costPriceAtTime);
                rangeUnitsSold += t.quantity;
            } else if (t.type === 'IN') {
                rangeInvestment += (t.quantity * t.unitPrice);
            }
        });

        console.log('DEBUG STATS:', {
            totalProducts,
            totalStock,
            stockValue,
            inventoryCostValue,
            rangeRevenue,
            rangeCOGS,
            rangeInvestment,
            rangeUnitsSold,
            transactionsCount: transactions.length
        });

        process.exit(0);
    } catch (err) {
        console.error('ERROR IN DASHBOARD LOGIC:', err);
        process.exit(1);
    }
}

debugDashboard();
