import { useState, useEffect } from 'react';
import api from '../api';
import { User, Shield, Mail, Lock, Plus, Users, UserPlus, Settings as SettingsIcon, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'employee' });
    const [profileData, setProfileData] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', password: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
        if (currentUser) {
            setProfileData({ name: currentUser.name, email: currentUser.email, password: '' });
        }
    }, [currentUser]);

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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...profileData };
            if (!payload.password) delete payload.password;

            await api.put('/auth/profile', payload);
            alert('Profile updated successfully!');
            // Refresh might be needed if state isn't globally synced, 
            // but the AuthContext useEffect we added will handle it on next check or we could just reload.
            window.location.reload();
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to update profile');
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
            try {
                await api.delete(`/users/${id}`);
                loadUsers();
            } catch (e) {
                alert(e.response?.data?.error || 'Failed to remove user');
            }
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                        System Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your profile and system user accounts</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-primary" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
                        <Users size={16} className="mr-2" />
                        {users.length} Active Users
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* My Profile Section */}
                <div className="card" style={{ border: '1px solid var(--border)', padding: '2rem', background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                            <SettingsIcon size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl" style={{ color: 'var(--text-main)', margin: 0 }}>My Profile Settings</h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>Full Name</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)' }}>
                                    <User size={18} />
                                </div>
                                <input className="input" style={{ paddingLeft: '2.8rem' }} value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>Email Address</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)' }}>
                                    <Mail size={18} />
                                </div>
                                <input type="email" className="input" style={{ paddingLeft: '2.8rem' }} value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '0.25rem', marginBottom: '0.25rem' }}>New Password (Leave blank to keep current)</label>
                            <div className="relative">
                                <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-light)' }}>
                                    <Lock size={18} />
                                </div>
                                <input type="password" className="input" style={{ paddingLeft: '2.8rem' }} placeholder="••••••••" value={profileData.password} onChange={e => setProfileData({ ...profileData, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '1rem' }}>
                                <Save size={20} className="mr-2" /> Update Profile
                            </button>
                        </div>
                    </form>
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
                                <div key={u.id} className="flex flex-col gap-5 p-6 rounded-2xl border transition-all group table-row-hover mb-6" style={{ background: 'var(--bg-app)', borderColor: 'var(--border)' }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner" style={{ background: 'var(--primary)', color: 'white' }}>
                                                {u.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-extrabold" style={{ color: 'var(--text-main)', transition: 'color 0.2s' }}>{u.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{u.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-light'}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {u.role}
                                            </span>
                                            {currentUser.role === 'admin' && u.role === 'employee' && (
                                                <button
                                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                                    className="p-2 rounded-xl text-red-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-red-100 transition-all"
                                                    title="Remove Employee"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {currentUser.role === 'admin' && u.role === 'employee' && (
                                        <div className="mt-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Target Assignment (Monthly)</div>
                                            <TargetManager userId={u.id} name={u.name} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .table-row-hover:hover { border-color: var(--primary) !important; filter: brightness(1.02); }
                .table-row-hover:hover .font-extrabold { color: var(--primary) !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
            `}} />
        </div>
    );
}

function TargetManager({ userId, name }) {
    const [target, setTarget] = useState({ units: 0, value: 0 });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const now = new Date();
            await api.post('/sales-targets', {
                userId,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                targetUnits: target.units,
                targetValue: target.value
            });
            alert(`Target updated for ${name}`);
        } catch (e) {
            alert('Failed to update target');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-muted block mb-1 ml-1">UNITS GOAL</label>
                <input
                    type="number"
                    className="input py-1.5 px-3 text-xs"
                    placeholder="Units"
                    value={target.units}
                    onChange={e => setTarget({ ...target, units: parseInt(e.target.value) || 0 })}
                />
            </div>
            <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold text-muted block mb-1 ml-1">REVENUE GOAL (৳)</label>
                <input
                    type="number"
                    className="input py-1.5 px-3 text-xs"
                    placeholder="Amount"
                    value={target.value}
                    onChange={e => setTarget({ ...target, value: parseFloat(e.target.value) || 0 })}
                />
            </div>
            <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary py-1.5 px-4 text-xs h-[34px] rounded-lg"
            >
                {saving ? '...' : 'Set Goal'}
            </button>
        </div>
    );
}

