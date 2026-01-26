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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                        System Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage user accounts and system configurations</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-primary" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
                        <Users size={16} className="mr-2" />
                        {users.length} Active Users
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem' }}>

                {/* Create User Form */}
                <div className="card" style={{ flex: '1 1 400px', border: '1px solid var(--border)', padding: '2rem', background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                            <UserPlus size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl" style={{ color: 'var(--text-main)', margin: 0 }}>Add New Member</h3>
                    </div>

                    <form onSubmit={handleCreateUser} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>Full Name</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)' }}>
                                    <User size={18} />
                                </div>
                                <input className="input" style={{ paddingLeft: '2.8rem' }} placeholder="e.g. John Doe" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>Email Address</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)' }}>
                                    <Mail size={18} />
                                </div>
                                <input type="email" className="input" style={{ paddingLeft: '2.8rem' }} placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>Secure Password</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)' }}>
                                    <Lock size={18} />
                                </div>
                                <input type="password" className="input" style={{ paddingLeft: '2.8rem' }} placeholder="••••••••" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>Access Role</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)', zIndex: 1 }}>
                                    <Shield size={18} />
                                </div>
                                <select className="input" style={{ paddingLeft: '2.8rem' }} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="employee">Employee (Limited Access)</option>
                                    <option value="admin">Administrator (Full Access)</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', marginTop: '1rem' }}>
                            <Plus size={20} className="mr-2" /> Create Account
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="card" style={{ flex: '1 1 400px', border: '1px solid var(--border)', padding: '2rem', background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: '12px', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex' }}>
                            <Users size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl" style={{ color: 'var(--text-main)', margin: 0 }}>System Users</h3>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading user directory...</div>
                        ) : users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl border transition-all group table-row-hover" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner" style={{ background: 'var(--primary)', color: 'white' }}>
                                        {u.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-extrabold" style={{ color: 'var(--text-main)', transition: 'color 0.2s' }}>{u.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{u.email}</div>
                                    </div>
                                </div>
                                <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-light'}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                .table-row-hover:hover { border-color: var(--primary) !important; transform: translateY(-2px); box-shadow: var(--shadow-hover); }
                .table-row-hover:hover .font-extrabold { color: var(--primary) !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
            `}} />
        </div>
    );
}
