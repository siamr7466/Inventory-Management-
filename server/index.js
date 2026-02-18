const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { sequelize, User, Category, Product, StockTransaction, ApprovalRequest, SalesTarget, Notification } = require('./models');
const { Op } = require('sequelize');

// Notification Helper
async function addNotification(userId, title, message, type = 'INFO', link = null) {
    try {
        await Notification.create({ userId, title, message, type, link });
    } catch (e) { console.error('Notification error:', e); }
}

const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const app = express();

// 1. Essential Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.set('trust proxy', 1); // Fixes session issues on Passenger

const PORT = process.env.PORT || 30002;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Database Sync & Initial Setup
sequelize.sync({ alter: true }).then(async () => {
    console.log('Database synced');
    // Ensure at least one admin exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
        await User.create({
            name: 'Admin User',
            email: 'admin@store.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin user created: admin@store.com / admin123');
    }
}).catch(err => console.error('DB Error:', err));

// 2. API ROUTES

// Auth Routes
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/auth/me', auth(), async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/auth/profile', auth(), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findByPk(req.user.id);

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// User Management
app.get('/api/users', auth(['admin']), async (req, res) => {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
});

app.post('/api/users', auth(['admin']), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.create({ name, email, password: password || 'welcome123', role: role || 'employee' });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/users/:id', auth(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: "You cannot delete your own admin account." });
        }
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "User not found." });
        if (user.role === 'admin') {
            return res.status(400).json({ error: "Administrator accounts cannot be deleted for safety." });
        }
        await user.destroy();
        res.json({ message: "User removed successfully." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Category Routes
app.get('/api/categories', auth(), async (req, res) => {
    const categories = await Category.findAll({ include: { model: Product, as: 'Products' } });
    res.json(categories);
});

app.post('/api/categories', auth(['admin']), async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.json(category);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/categories/:id', auth(['admin']), async (req, res) => {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// Product Routes
app.get('/api/products', auth(), async (req, res) => {
    const products = await Product.findAll({ include: { model: Category, as: 'Category' } });
    res.json(products);
});

app.post('/api/products', auth(['admin']), async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/products/:id', auth(['admin']), async (req, res) => {
    try {
        await Product.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/products/:id', auth(['admin']), async (req, res) => {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// Stock Management
app.post('/api/stock/update', auth(['admin']), async (req, res) => {
    const { productId, quantity, type } = req.body;
    const t = await sequelize.transaction();
    try {
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) throw new Error('Product not found');

        let newStock = product.currentStock;
        if (type === 'IN') newStock += quantity;
        if (type === 'OUT') {
            if (newStock < quantity) throw new Error('Insufficient stock');
            newStock -= quantity;
        }

        product.currentStock = newStock;
        if (newStock === 0) product.status = 'Out of Stock';
        else if (newStock < 10) product.status = 'Low Stock';
        else product.status = 'Available';

        await product.save({ transaction: t });
        await StockTransaction.create({
            productId,
            quantity,
            type,
            unitPrice: type === 'IN' ? product.costPrice : product.price,
            costPriceAtTime: product.costPrice,
            userId: req.user.id,
            date: new Date()
        }, { transaction: t });

        await t.commit();
        res.json(product);
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// Approval System
app.post('/api/approval/request', auth(['employee']), async (req, res) => {
    const { productId, quantity, type } = req.body;
    try {
        const product = await Product.findByPk(productId);
        const request = await ApprovalRequest.create({
            productId,
            quantity,
            type,
            RequesterId: req.user.id
        });

        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
            await addNotification(
                admin.id,
                'New Approval Request',
                `${req.user.name} requested to stock ${type} ${quantity} units of ${product.brand} ${product.modelName}`,
                'WARNING',
                '/approvals'
            );
        }
        res.json(request);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/approval/pending', auth(['admin']), async (req, res) => {
    const requests = await ApprovalRequest.findAll({
        where: { status: 'PENDING' },
        include: [{ model: Product, as: 'Product' }, { model: User, as: 'Requester' }]
    });
    res.json(requests);
});

app.post('/api/approval/action', auth(['admin']), async (req, res) => {
    const { requestId, action } = req.body;
    const t = await sequelize.transaction();
    try {
        const request = await ApprovalRequest.findByPk(requestId, {
            transaction: t,
            include: [{ model: Product, as: 'Product' }]
        });
        if (!request) throw new Error('Request not found');

        request.status = action;
        await request.save({ transaction: t });

        if (action === 'APPROVED') {
            const product = await Product.findByPk(request.productId, { transaction: t });
            let newStock = product.currentStock;
            if (request.type === 'IN') newStock += request.quantity;
            if (request.type === 'OUT') {
                if (newStock < request.quantity) throw new Error('Insufficient stock for approval');
                newStock -= request.quantity;
            }

            product.currentStock = newStock;
            product.status = newStock === 0 ? 'Out of Stock' : (newStock < 10 ? 'Low Stock' : 'Available');

            await product.save({ transaction: t });
            await StockTransaction.create({
                productId: request.productId,
                quantity: request.quantity,
                type: request.type,
                unitPrice: request.type === 'IN' ? product.costPrice : product.price,
                costPriceAtTime: product.costPrice,
                userId: request.RequesterId,
                date: new Date()
            }, { transaction: t });
        }

        await addNotification(
            request.RequesterId,
            `Request ${action}`,
            `Your request for ${request.quantity} units of ${request.Product.brand} ${request.Product.modelName} was ${action.toLowerCase()} by admin.`,
            action === 'APPROVED' ? 'SUCCESS' : 'DANGER'
        );

        await t.commit();
        res.json({ success: true });
    } catch (e) {
        await t.rollback();
        res.status(400).json({ error: e.message });
    }
});

// Reports & Targets
app.get('/api/transactions', auth(['admin']), async (req, res) => {
    const transactions = await StockTransaction.findAll({
        include: [{ model: Product, as: 'Product' }, { model: User, as: 'User' }],
        order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
});

app.get('/api/sales-targets', auth(['admin']), async (req, res) => {
    const targets = await SalesTarget.findAll({ include: [{ model: User, as: 'User', attributes: ['name', 'email'] }] });
    res.json(targets);
});

app.post('/api/sales-targets', auth(['admin']), async (req, res) => {
    try {
        const { userId, month, year, targetUnits, targetValue } = req.body;
        let target = await SalesTarget.findOne({ where: { userId, month, year } });
        if (target) {
            await target.update({ targetUnits, targetValue });
        } else {
            target = await SalesTarget.create({ userId, month, year, targetUnits, targetValue });
        }
        res.json(target);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// Notifications
app.get('/api/notifications', auth(), async (req, res) => {
    const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 20
    });
    res.json(notifications);
});

app.patch('/api/notifications/:id/read', auth(), async (req, res) => {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true });
});

// Dashboard Analytics
app.get('/api/dashboard/stats', auth(), async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const userId = req.user.id;
        const { range = '7d' } = req.query;

        const products = await Product.findAll();
        const totalProducts = products.length;
        const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
        const stockValue = products.reduce((acc, p) => acc + (p.currentStock * p.price), 0);
        const inventoryCostValue = products.reduce((acc, p) => acc + (p.currentStock * (p.costPrice || 0)), 0);

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        let targetData = null;
        if (!isAdmin) {
            targetData = await SalesTarget.findOne({ where: { userId, month: currentMonth, year: currentYear } });
        }

        const pendingApprovals = isAdmin
            ? await ApprovalRequest.count({ where: { status: 'PENDING' } })
            : await ApprovalRequest.count({ where: { status: 'PENDING', RequesterId: userId } });

        const stockStatus = {
            Available: products.filter(p => p.status === 'Available').length,
            LowStock: products.filter(p => p.status === 'Low Stock').length,
            OutOfStock: products.filter(p => p.status === 'Out of Stock').length,
        };

        const today = new Date();
        let startDate = new Date();
        if (range === '30d') startDate.setDate(today.getDate() - 30);
        else if (range === '12m') startDate.setFullYear(today.getFullYear() - 1);
        else if (range === 'all') {
            const firstTx = await StockTransaction.findOne({ order: [['date', 'ASC']] });
            startDate = firstTx ? new Date(firstTx.date) : new Date(today.getFullYear(), 0, 1);
        } else startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const txWhere = { date: { [Op.gte]: startDate } };
        if (!isAdmin) txWhere.userId = userId;

        const transactions = await StockTransaction.findAll({
            where: txWhere,
            include: [{ model: Product, as: 'Product' }],
            order: [['date', 'ASC']]
        });

        let rangeRevenue = 0, rangeCOGS = 0, rangeInvestment = 0, rangeUnitsSold = 0;
        transactions.forEach(t => {
            if (t.type === 'OUT') {
                rangeRevenue += (t.quantity * t.unitPrice);
                rangeCOGS += (t.quantity * t.costPriceAtTime);
                rangeUnitsSold += t.quantity;
            } else if (t.type === 'IN') {
                rangeInvestment += (t.quantity * t.unitPrice);
            }
        });

        const trendMap = {};
        if (range === '12m') {
            for (let i = 0; i < 12; i++) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                trendMap[key] = { name: d.toLocaleDateString('en-US', { month: 'short' }), sales: 0, unitsSold: 0 };
            }
        } else {
            const diffInDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
            for (let i = 0; i < (range === 'all' ? Math.min(diffInDays, 365) : diffInDays); i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const key = d.toLocaleDateString('en-CA');
                trendMap[key] = { name: range === '7d' ? d.toLocaleDateString('en-US', { weekday: 'short' }) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: 0, unitsSold: 0 };
            }
        }

        transactions.forEach(t => {
            if (t.type === 'OUT') {
                const d = new Date(t.date);
                const key = range === '12m' ? `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}` : d.toLocaleDateString('en-CA');
                if (trendMap[key]) {
                    trendMap[key].sales += (t.quantity * t.unitPrice);
                    trendMap[key].unitsSold += t.quantity;
                }
            }
        });

        res.json({
            totalProducts, totalStock, stockValue, inventoryCostValue, pendingApprovals, stockStatus,
            trendData: Object.values(trendMap),
            financials: { revenue: rangeRevenue, cost: rangeCOGS, profit: rangeRevenue - rangeCOGS, investment: rangeInvestment, unitsSold: rangeUnitsSold },
            monthlyStats: { unitsSold: rangeUnitsSold, revenue: rangeRevenue, target: targetData ? { units: targetData.targetUnits, value: targetData.targetValue } : null }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 3. STATIC FILES & SPA RELOAD FIX
app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: "API not found" });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

