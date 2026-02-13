const { Category, Product } = require('./models');

async function check() {
    try {
        const categories = await Category.findAll({
            include: [{ model: Product, as: 'Products' }]
        });
        console.log('Categories found:', JSON.stringify(categories, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error fetching categories:', err);
        process.exit(1);
    }
}

check();
