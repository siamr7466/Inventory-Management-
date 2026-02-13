const { sequelize, Category, Product } = require('./models');

const addProducts = async () => {
    try {
        // Ensure Categories exist
        const [smartphones] = await Category.findOrCreate({
            where: { name: 'Smartphones' },
            defaults: { description: 'Latest mobile devices' }
        });

        const [accessories] = await Category.findOrCreate({
            where: { name: 'Accessories' },
            defaults: { description: 'Cases, chargers, and more' }
        });

        const [laptops] = await Category.findOrCreate({
            where: { name: 'Laptops' },
            defaults: { description: 'Portable computers' }
        });

        const productsData = [
            { brand: 'Apple', modelName: 'iPhone 15 Pro', costPrice: 900, price: 999, currentStock: 45, status: 'Available', CategoryId: smartphones.id, barcode: 'IP15P-001' },
            { brand: 'Samsung', modelName: 'Galaxy S24 Ultra', costPrice: 1000, price: 1199, currentStock: 30, status: 'Available', CategoryId: smartphones.id, barcode: 'S24U-002' },
            { brand: 'Apple', modelName: 'AirPods Pro 2', costPrice: 200, price: 249, currentStock: 8, status: 'Low Stock', CategoryId: accessories.id, barcode: 'APP2-003' },
            { brand: 'Google', modelName: 'Pixel 8', costPrice: 600, price: 699, currentStock: 0, status: 'Out of Stock', CategoryId: smartphones.id, barcode: 'PX8-004' },
            { brand: 'Dell', modelName: 'XPS 13', costPrice: 1100, price: 1299, currentStock: 12, status: 'Available', CategoryId: laptops.id, barcode: 'DXPS13-009' },
            { brand: 'Sony', modelName: 'WH-1000XM5', costPrice: 300, price: 399, currentStock: 25, status: 'Available', CategoryId: accessories.id, barcode: 'SXM5-010' },
            { brand: 'Logitech', modelName: 'MX Master 3S', costPrice: 80, price: 99, currentStock: 15, status: 'Available', CategoryId: accessories.id, barcode: 'LMX3S-011' }
        ];

        for (const p of productsData) {
            await Product.findOrCreate({
                where: { barcode: p.barcode },
                defaults: p
            });
        }

        console.log('Sample products added successfully (skipped duplicates).');
        process.exit(0);
    } catch (error) {
        console.error('Error adding products:', error);
        process.exit(1);
    }
};

addProducts();
