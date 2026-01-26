async function testLogin() {
    try {
        const res = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@store.com',
                password: 'admin123'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('Login successful:', data.user.email);
        } else {
            console.error('Login failed:', data);
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
}

testLogin();
