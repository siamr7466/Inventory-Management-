import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Package, LayoutGrid } from 'lucide-react';

export default function Products() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        brand: '',
        modelName: '',
        CategoryId: '',
        price: '',
        costPrice: '',
        currentStock: '',
        barcode: ''
    });


    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
    }, [searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(pRes.data);
            setCategories(cRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await api.delete(`/products/${id}`);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', formData);
            setShowModal(false);
            setFormData({ brand: '', modelName: '', CategoryId: '', price: '', costPrice: '', currentStock: '', barcode: '' });
            loadData();

        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save product');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.modelName.toLowerCase().includes(search.toLowerCase()) ||
            p.brand.toLowerCase().includes(search.toLowerCase()) ||
            p.barcode?.includes(search);
        const matchesCategory = selectedCategory === 'all' || p.CategoryId === parseInt(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 style={{ fontSize: '2rem', fontStyle: 'normal', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Products</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage and track your product inventory</p>
                </div>
                {user.role === 'admin' && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
                        <Plus size={20} /> <span className="font-bold">Add Product</span>
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="card flex-1" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <Search style={{ color: 'var(--text-muted)' }} size={20} />
                    <input
                        placeholder="Search by brand, model..."
                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: 'var(--text-main)' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', minWidth: '200px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                        <LayoutGrid size={18} />
                    </div>
                    <select
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontWeight: 700, paddingLeft: '2.2rem', cursor: 'pointer' }}
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            if (e.target.value === 'all') {
                                searchParams.delete('category');
                            } else {
                                searchParams.set('category', e.target.value);
                            }
                            setSearchParams(searchParams);
                        }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MODEL & BRAND</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CATEGORY</th>
                                {user.role === 'admin' && <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>COST PRICE</th>}
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SALE PRICE</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STOCK</th>

                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                                {user.role === 'admin' && <th className="p-4 text-right font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIONS</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={user.role === 'admin' ? 7 : 5} className="p-12 text-center text-muted">Loading...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={user.role === 'admin' ? 7 : 5} className="p-12 text-center text-muted">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                        <td className="p-4">
                                            <div className="font-bold" style={{ color: 'var(--text-main)' }}>{p.modelName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand} {p.barcode ? `• ${p.barcode}` : ''}</div>
                                        </td>
                                        <td className="p-4">
                                            <span style={{ padding: '4px 8px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {p.Category?.name || 'GENERIC'}
                                            </span>
                                        </td>
                                        {user.role === 'admin' && <td className="p-4 font-bold" style={{ color: 'var(--text-muted)' }}>৳{p.costPrice?.toLocaleString()}</td>}
                                        <td className="p-4 font-bold" style={{ color: 'var(--text-main)' }}>৳{p.price.toLocaleString()}</td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                                <span className="font-bold">{p.currentStock}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>pcs</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${p.status === 'Available' ? 'badge-success' : p.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`} style={{ borderRadius: '8px' }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        {user.role === 'admin' && (
                                            <td className="p-4 text-right">
                                                <button
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '450px', padding: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Add New Product</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-2">Details</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input placeholder="Brand" className="input" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                    <input placeholder="Model Name" className="input" required value={formData.modelName} onChange={e => setFormData({ ...formData, modelName: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-2">Category</label>
                                <select className="input" required value={formData.CategoryId} onChange={e => setFormData({ ...formData, CategoryId: e.target.value })}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase mb-2">Cost Price (৳)</label>
                                    <input type="number" placeholder="Buy Price" className="input" required value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase mb-2">Sale Price (৳)</label>
                                    <input type="number" placeholder="Sell Price" className="input" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-2">Initial Stock</label>
                                <input type="number" placeholder="0" className="input" required value={formData.currentStock} onChange={e => setFormData({ ...formData, currentStock: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-2">Barcode (Optional)</label>
                                <input placeholder="Enter barcode" className="input" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .table-row-hover:hover { background: var(--bg-app) !important; }
            `}} />
        </div>
    );
}
