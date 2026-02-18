const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DB_NAME) {
  // Priority: User provided MySQL credentials
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  });
} else if (process.env.DATABASE_URL) {
  const isPostgres = process.env.DATABASE_URL.startsWith('postgres');
  const isMysql = process.env.DATABASE_URL.startsWith('mysql');

  if (isPostgres) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    });
  } else if (isMysql) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false
    });
  } else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: false
    });
  }
} else {
  // Local: SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'inventory.sqlite'),
    logging: false
  });
}

module.exports = sequelize;

