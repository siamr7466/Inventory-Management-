const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function check() {
    const users = await User.findAll();
    console.log('Users in DB:');
    for (const user of users) {
        console.log(`- ${user.email} (Role: ${user.role})`);
    }
}

check().then(() => process.exit());
