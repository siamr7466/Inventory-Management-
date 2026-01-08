import { useState, useEffect } from 'react';
import api from '../api';
import { User, Shield, Mail, Lock, Plus } from 'lucide-react';

export default function Settings() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (e) { console.error(e); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
            loadUsers();
            alert('User created successfully');
        } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Settings</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Create User Form */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus className="text-primary" /> Create New User
                    </h3>
                    <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input className="input pl-10" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="email" className="input pl-10" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" className="input pl-10" placeholder="Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select className="input pl-10" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ paddingLeft: '2.5rem' }}>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary mt-2">Create Account</button>
                    </form>
                </div>

                {/* User List */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-4">System Users</h3>
                    <div className="flex flex-col gap-3">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{u.name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
