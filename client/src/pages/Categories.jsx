import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Search, Tag, Package, Box, Smartphone, LayoutGrid, Tablet, Laptop, Headphones, Watch, Speaker, MousePointer2 } from 'lucide-react';

export default function Categories() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', description: '' });

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
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Categories</h1>
                    <p className="text-gray-500">Manage your product grouping and hierarchy</p>
                </div>
                {user.role === 'admin' && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                        <Plus size={20} /> <span className="font-bold">New Category</span>
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '1rem', outline: 'none' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-gray-400 font-medium">Loading premium categories...</div>
            ) : filteredCategories.length === 0 ? (
                <div className="card text-center p-12">
                    <div className="flex justify-center mb-4 text-gray-300">
                        <LayoutGrid size={64} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No categories found</h3>
                    <p className="text-gray-500">Try adjusting your search or add a new category to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredCategories.map(c => (
                        <div key={c.id} className="card relative transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group" style={{ minHeight: '180px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                                    {getCategoryIcon(c.name)}
                                </div>
                                {user.role === 'admin' && (
                                    <button
                                        className="p-2 text-gray-300 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <h3 className="font-bold text-xl mb-1 text-gray-900">{c.name}</h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">{c.description || 'No detailed description provided for this category.'}</p>

                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <Package size={16} />
                                    <span>{c.Products?.length || 0} Products</span>
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                    ID: #{c.id.toString().padStart(3, '0')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', animation: 'slideUp 0.3s ease-out' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900">Add Category</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-1 block">Category Name</label>
                                <input placeholder="e.g. Smartwatches" className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-1 block">Description (Optional)</label>
                                <textarea placeholder="Enter category details..." className="input" rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="btn" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => setShowModal(false)}>Cancel</button>
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
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}} />
        </div>
    );
}
