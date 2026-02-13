const axios = require('axios');

async function test() {
    try {
        // Step 1: Login to get token
        const loginRes = await axios.post('http://localhost:3001/api/login', {
            email: 'admin@store.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        // Step 2: Call dashboard stats
        const statsRes = await axios.get('http://localhost:3001/api/dashboard/stats?range=7d', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dashboard Stats Response:', JSON.stringify(statsRes.data, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error testing dashboard API:', err.response?.data || err.message);
        process.exit(1);
    }
}

test();
