const { sequelize, User, Category, Product, StockTransaction, ApprovalRequest } = require('./models');
const bcrypt = require('bcrypt');

const seed = async () => {
    await sequelize.sync({ force: true });
    console.log('Database Reset');

    // Users
    const password = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@store.com',
        password,
        role: 'admin'
    });

    const empPassword = await bcrypt.hash('employee123', 10);
    const employee = await User.create({
        name: 'John Doe',
        email: 'employee@store.com',
        password: empPassword,
        role: 'employee'
    });

    // Categories
    const cats = await Category.bulkCreate([
        { name: 'Smartphones', description: 'Latest mobile devices' },
        { name: 'Accessories', description: 'Cases, chargers, and more' },
        { name: 'Tablets', description: 'iPads and Android tablets' },
        { name: 'Wearables', description: 'Smartwatches and fitness trackers' }
    ]);

    // Products
    const products = await Product.bulkCreate([
        { brand: 'Apple', modelName: 'iPhone 15 Pro', price: 999, currentStock: 45, status: 'Available', CategoryId: cats[0].id, barcode: 'IP15P-001' },
        { brand: 'Samsung', modelName: 'Galaxy S24 Ultra', price: 1199, currentStock: 30, status: 'Available', CategoryId: cats[0].id, barcode: 'S24U-002' },
        { brand: 'Apple', modelName: 'AirPods Pro 2', price: 249, currentStock: 8, status: 'Low Stock', CategoryId: cats[1].id, barcode: 'APP2-003' },
        { brand: 'Google', modelName: 'Pixel 8', price: 699, currentStock: 0, status: 'Out of Stock', CategoryId: cats[0].id, barcode: 'PX8-004' },
        { brand: 'Samsung', modelName: 'Galaxy Tab S9', price: 799, currentStock: 15, status: 'Available', CategoryId: cats[2].id, barcode: 'GTS9-005' },
        { brand: 'Apple', modelName: 'Watch Series 9', price: 399, currentStock: 22, status: 'Available', CategoryId: cats[3].id, barcode: 'AWS9-006' },
        { brand: 'Nothing', modelName: 'Phone (2)', price: 599, currentStock: 5, status: 'Low Stock', CategoryId: cats[0].id, barcode: 'NP2-007' },
        { brand: 'Spigen', modelName: 'iPhone 15 Case', price: 25, currentStock: 100, status: 'Available', CategoryId: cats[1].id, barcode: 'SPC-008' },
    ]);

    // Transactions (Mock History)
    const transactions = [];
    const now = new Date();

    // Create guaranteed recent transactions for chart demo
    for (let i = 0; i < 50; i++) {
        const isOut = Math.random() > 0.4; // More sales
        // Randomize date within last 4 days to ensure they appear on the 7-day chart
        const dateOffset = Math.floor(Math.random() * 4);
        const d = new Date(now);
        d.setDate(d.getDate() - dateOffset);
        d.setHours(Math.random() * 23, Math.random() * 59);

        transactions.push({
            quantity: Math.ceil(Math.random() * 5),
            type: isOut ? 'OUT' : 'IN',
            date: d,
            ProductId: products[Math.floor(Math.random() * products.length)].id,
            UserId: isOut ? employee.id : admin.id
        });
    }
    await StockTransaction.bulkCreate(transactions);

    console.log('Database Seeded Successfully');
    process.exit();
};

seed();
