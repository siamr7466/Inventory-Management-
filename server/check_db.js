const { sequelize } = require('./models');
sequelize.getQueryInterface().describeTable('Products').then(attributes => {
    console.log(attributes);
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
