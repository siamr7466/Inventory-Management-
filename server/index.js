const express = require('express');
const cors = require('cors');
const { sequelize, User, Category, Product, StockTransaction, ApprovalRequest } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const app = express();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

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
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

app.post('/api/users', auth(['admin']), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/users', auth(['admin']), async (req, res) => {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
});

// Category Routes
app.get('/api/categories', auth(), async (req, res) => {
    const categories = await Category.findAll({ include: Product }); // Include to count products
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
    const products = await Product.findAll({ include: Category });
    res.json(products);
});

app.post('/api/products', auth(['admin']), upload.single('image'), async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.imageUrl = `/uploads/${req.file.filename}`;
        }
        const product = await Product.create(data);
        res.json(product);
    } catch (e) {
        console.error(e);
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
        const request = await ApprovalRequest.create({
            productId,
            quantity,
            type,
            RequesterId: req.user.id
        });
        res.json(request);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/approval/pending', auth(['admin']), async (req, res) => {
    const requests = await ApprovalRequest.findAll({
        where: { status: 'PENDING' },
        include: [Product, { model: User, as: 'Requester' }]
    });
    res.json(requests);
});

app.post('/api/approval/action', auth(['admin']), async (req, res) => {
    const { requestId, action } = req.body; // action: APPROVED or REJECTED
    const t = await sequelize.transaction();
    try {
        const request = await ApprovalRequest.findByPk(requestId, { transaction: t });
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
                userId: request.RequesterId // Attribute to original requester? Or Approver? Prompt says "User who performed action" -> maybe Approver or Requester. Let's say Requester initiated it, but Admin approved it. Let's log it as Transaction by Requester approved by Admin. 
            }, { transaction: t });
        }

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
        include: [Product, User],
        order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
});

// Dashboard Analytics
app.get('/api/dashboard/stats', auth(['admin']), async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        const totalProducts = await Product.count();
        const products = await Product.findAll();
        const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
        const stockValue = products.reduce((acc, p) => acc + (p.currentStock * p.price), 0);
        const pendingApprovals = await ApprovalRequest.count({ where: { status: 'PENDING' } });

        const stockStatus = {
            Available: products.filter(p => p.status === 'Available').length,
            LowStock: products.filter(p => p.status === 'Low Stock').length,
            OutOfStock: products.filter(p => p.status === 'Out of Stock').length,
        };

        const { Op } = require('sequelize');
        const today = new Date();
        let startDate = new Date();

        if (range === '30d') {
            startDate.setDate(today.getDate() - 29);
        } else if (range === 'all') {
            const firstTx = await StockTransaction.findOne({ order: [['date', 'ASC']] });
            if (firstTx) {
                startDate = new Date(firstTx.date);
            } else {
                startDate.setDate(today.getDate() - 6);
            }
        } else {
            // Default 7 days
            startDate.setDate(today.getDate() - 6);
        }
        startDate.setHours(0, 0, 0, 0);

        const transactions = await StockTransaction.findAll({
            where: {
                date: { [Op.gte]: startDate }
            },
            include: [Product],
            order: [['date', 'ASC']]
        });

        const trendMap = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Initialize range keys
        const diffInDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        const limitCount = range === 'all' ? Math.min(diffInDays, 90) : diffInDays; // Avoid crashing on too many days

        for (let i = 0; i < limitCount; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const key = d.toLocaleDateString('en-CA');
            const dayName = days[d.getDay()];

            // For 30d or all, showing month/day instead of Mon/Tue might be better
            const label = range === '30d' || range === 'all'
                ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : dayName;

            trendMap[key] = { name: label, sales: 0, stock: 0 };
        }

        transactions.forEach(t => {
            try {
                const d = new Date(t.date);
                const key = d.toLocaleDateString('en-CA');
                if (trendMap[key]) {
                    if (t.type === 'OUT') {
                        trendMap[key].sales += (t.quantity * (t.Product?.price || 0));
                    } else if (t.type === 'IN') {
                        trendMap[key].stock += (t.quantity * (t.Product?.price || 0));
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
            trendData
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
