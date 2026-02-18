const { User } = require('./models');

async function check() {
    const users = await User.findAll();
    console.log('Users in DB:');
    for (const user of users) {
        console.log(`- ${user.email} (Role: ${user.role})`);
    }
}

check().then(() => process.exit());
