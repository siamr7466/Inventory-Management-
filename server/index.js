const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, User, Category, Product, StockTransaction, ApprovalRequest, SalesTarget, Notification } = require('./models');
const { Op } = require('sequelize');

// Notification Helper
async function addNotification(userId, title, message, type = 'INFO', link = null) {
    try {
        await Notification.create({ userId, title, message, type, link });
    } catch (e) { console.error('Notification error:', e); }
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Sync DB and Seed Admin
sequelize.sync({ force: false }).then(async () => {
    console.log('Database synced');
    const adminExists = await User.findOne({ where: { email: 'admin@store.com' } });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@store.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin user created: admin@store.com / admin123');
    }
});

// Auth Routes
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Invalid password for: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`Login successful for: ${email}`);
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
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/api/users', auth(['admin']), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'welcome123', 10);
        const user = await User.create({ name, email, password: hashedPassword, role: role || 'employee' });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) { res.status(400).json({ error: e.message }); }
});


app.get('/api/users', auth(['admin']), async (req, res) => {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
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

// Sales Targets
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

app.get('/api/sales-targets', auth(['admin']), async (req, res) => {
    const targets = await SalesTarget.findAll({ include: [{ model: User, as: 'User', attributes: ['name', 'email'] }] });
    res.json(targets);
});


// Category Routes
app.get('/api/categories', auth(), async (req, res) => {
    const categories = await Category.findAll({ include: { model: Product, as: 'Products' } }); // Include to count products
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
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
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
    const { productId, quantity, type } = req.body; // type: IN or OUT
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
            userId: req.user.id
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

        // Notify Admins
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
    const { requestId, action } = req.body; // action: APPROVED or REJECTED
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
            if (newStock === 0) product.status = 'Out of Stock';
            else if (newStock < 10) product.status = 'Low Stock';
            else product.status = 'Available';

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

        // Notify Requester
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


// Reports & Analytics
app.get('/api/transactions', auth(['admin']), async (req, res) => {
    const transactions = await StockTransaction.findAll({
        include: [{ model: Product, as: 'Product' }, { model: User, as: 'User' }],
        order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
});

// Dashboard Analytics
app.get('/api/dashboard/stats', auth(), async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const userId = req.user.id;
        const { range = '7d' } = req.query;

        const totalProducts = await Product.count();
        const products = await Product.findAll();
        const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
        const stockValue = products.reduce((acc, p) => acc + (p.currentStock * p.price), 0);

        // Target Logic
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

        if (range === '30d') {
            startDate.setDate(today.getDate() - 29);
        } else if (range === 'all') {
            const firstTx = await StockTransaction.findOne({
                where: isAdmin ? {} : { userId },
                order: [['date', 'ASC']]
            });
            if (firstTx) {
                startDate = new Date(firstTx.date);
            } else {
                startDate.setDate(today.getDate() - 6);
            }
        } else {
            startDate.setDate(today.getDate() - 6);
        }
        startDate.setHours(0, 0, 0, 0);

        const txWhere = { date: { [Op.gte]: startDate } };
        if (!isAdmin) txWhere.userId = userId;

        const transactions = await StockTransaction.findAll({
            where: txWhere,
            include: [{ model: Product, as: 'Product' }],
            order: [['date', 'ASC']]
        });

        // Monthly Stats for Progress
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlySoldWhere = {
            date: { [Op.gte]: startOfMonth },
            type: 'OUT'
        };
        if (!isAdmin) monthlySoldWhere.userId = userId;

        const monthlyTransactions = await StockTransaction.findAll({
            where: monthlySoldWhere,
            include: [{ model: Product, as: 'Product' }]
        });

        const monthlyUnitsSold = monthlyTransactions.reduce((acc, t) => acc + t.quantity, 0);
        const monthlyRevenue = monthlyTransactions.reduce((acc, t) => acc + (t.quantity * (t.Product?.price || 0)), 0);

        const trendMap = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const diffInDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        const limitCount = range === 'all' ? Math.min(diffInDays, 90) : diffInDays;

        for (let i = 0; i < limitCount; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const key = d.toLocaleDateString('en-CA');
            const dayName = days[d.getDay()];

            const label = range === '30d' || range === 'all'
                ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : dayName;

            trendMap[key] = { name: label, sales: 0, stock: 0, unitsSold: 0, unitsAdded: 0 };
        }

        transactions.forEach(t => {
            try {
                const d = new Date(t.date);
                const key = d.toLocaleDateString('en-CA');
                if (trendMap[key]) {
                    if (t.type === 'OUT') {
                        trendMap[key].sales += (t.quantity * (t.Product?.price || 0));
                        trendMap[key].unitsSold += t.quantity;
                    } else if (t.type === 'IN') {
                        trendMap[key].stock += (t.quantity * (t.Product?.price || 0));
                        trendMap[key].unitsAdded += t.quantity;
                    }
                }
            } catch (err) { }
        });

        const trendData = Object.values(trendMap);

        res.json({
            totalProducts,
            totalStock,
            stockValue,
            pendingApprovals,
            stockStatus,
            trendData,
            monthlyStats: {
                unitsSold: monthlyUnitsSold,
                revenue: monthlyRevenue,
                target: targetData ? {
                    units: targetData.targetUnits,
                    value: targetData.targetValue
                } : null
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
