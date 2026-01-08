import { useState, useEffect } from 'react';
import api from '../api';
import { User, Shield, Mail, Lock, Plus, Users, UserPlus, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setFormData({ name: '', email: '', password: '', role: 'employee' });
            loadUsers();
            alert('User account created successfully!');
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to create user');
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        System Settings
                    </h1>
                    <p className="text-gray-500">Manage user accounts and system configurations</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-primary" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
                        <Users size={16} className="mr-2" />
                        {users.length} Active Users
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>

                {/* Create User Form */}
                <div className="card" style={{ border: '1px solid var(--border)', padding: '2rem' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)' }}>
                            <UserPlus size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl text-gray-900">Add New Member</h3>
                    </div>

                    <form onSubmit={handleCreateUser} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input className="input" style={{ paddingLeft: '3rem' }} placeholder="e.g. John Doe" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" className="input" style={{ paddingLeft: '3rem' }} placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="password" className="input" style={{ paddingLeft: '3rem' }} placeholder="••••••••" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Access Role</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select className="input" style={{ paddingLeft: '3rem' }} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="employee">Employee (Limited Access)</option>
                                    <option value="admin">Administrator (Full Access)</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary mt-4" style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem' }}>
                            <Plus size={20} className="mr-2" /> Create Account
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="card" style={{ border: '1px solid var(--border)', padding: '2rem' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: '12px', color: 'var(--text-main)' }}>
                            <Users size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl text-gray-900">System Users</h3>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 font-medium">Loading user directory...</div>
                        ) : users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
                                        {u.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-gray-900 group-hover:text-primary transition-colors">{u.name}</div>
                                        <div className="text-xs text-gray-500 font-medium">{u.email}</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
}
