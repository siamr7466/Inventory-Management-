import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Search, Tag, Package, Box, Smartphone, LayoutGrid, Tablet, Laptop, Headphones, Watch, Speaker, MousePointer2 } from 'lucide-react';

export default function Categories() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', description: '' });

    const getSmartId = (cat) => {
        if (!cat) return 'CAT-000';
        const prefix = (cat.name || 'GEN').substring(0, 4).toUpperCase();
        return `${prefix}-${cat.id.toString().padStart(3, '0')}`;
    };

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this category? All related products will be affected.')) {
            await api.delete(`/categories/${id}`);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', formData);
            setShowModal(false);
            setFormData({ name: '', description: '' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add category");
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSmartId(c).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('phone') || lower.includes('mobile')) return <Smartphone size={24} />;
        if (lower.includes('tablet')) return <Tablet size={24} />;
        if (lower.includes('laptop')) return <Laptop size={24} />;
        if (lower.includes('headphone') || lower.includes('audio')) return <Headphones size={24} />;
        if (lower.includes('watch') || lower.includes('wearable')) return <Watch size={24} />;
        if (lower.includes('speaker')) return <Speaker size={24} />;
        if (lower.includes('accessory')) return <MousePointer2 size={24} />;
        if (lower.includes('gadget')) return <Box size={24} />;
        return <Tag size={24} />;
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>Categories</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your product grouping and hierarchy</p>
                </div>
                {user.role === 'admin' && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', width: '100%', mdWidth: 'auto', justifyContent: 'center' }}>
                        <Plus size={20} /> <span className="font-bold">New Category</span>
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Search style={{ color: 'var(--text-muted)' }} size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '1rem', outline: 'none', color: 'var(--text-main)' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                    <div className="loading-spinner"></div>
                    <span style={{ marginLeft: '1rem' }}>Loading categories...</span>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="card text-center p-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-center mb-4" style={{ color: 'var(--text-light)' }}>
                        <LayoutGrid size={64} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>No categories found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or add a new category to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {filteredCategories.map(c => (
                        <div key={c.id} className="card relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer"
                            onClick={() => navigate(`/products?category=${c.id}`)}
                            style={{
                                minHeight: '200px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                            <div className="flex items-start justify-between mb-4">
                                <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                                    {getCategoryIcon(c.name)}
                                </div>
                                {user.role === 'admin' && (
                                    <button
                                        className="p-2 rounded-lg transition-colors"
                                        style={{
                                            background: 'transparent',
                                            color: 'var(--text-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger-text)'; e.currentTarget.style.background = 'var(--danger-bg)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.background = 'transparent'; }}
                                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--text-main)', margin: 0 }}>{c.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flex: 1 }} className="line-clamp-3">
                                {c.description || 'No detailed description provided for this category.'}
                            </p>

                            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                                <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--primary)' }}>
                                    <Package size={16} />
                                    <span>{c.Products?.length || 0} Products</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500 }}>
                                    ID: {getSmartId(c)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', animation: 'slideUp 0.3s ease-out', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-hover)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-main)', margin: 0 }}>Add Category</h2>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', fontSize: '1.5rem', background: 'transparent', padding: '0.5rem', display: 'flex', alignItems: 'center' }} className="hover:text-main">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Category Name</label>
                                <input placeholder="e.g. Smartwatches" className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Description (Optional)</label>
                                <textarea placeholder="Enter category details..." className="input" rows="4" style={{ resize: 'none' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="btn" style={{ background: 'var(--bg-app)', color: 'var(--text-muted)', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Create Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
                .loading-spinner { width: 24px; height: 24px; border: 3px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .flex-col { flex-direction: column !important; }
                    .w-full { width: 100% !important; }
                }
            `}} />
        </div>
    );
}
