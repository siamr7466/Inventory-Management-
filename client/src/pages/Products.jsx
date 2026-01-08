import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Edit, Package, DollarSign, Barcode, Filter, ArrowUpDown, Image as ImageIcon, X } from 'lucide-react';

export default function Products() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Form State
    const [formData, setFormData] = useState({ brand: '', modelName: '', categoryId: '', price: '', currentStock: '', barcode: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
            setProducts(pRes.data);
            setCategories(cRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            await api.delete(`/products/${id}`);
            loadData();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setFormData({ brand: '', modelName: '', categoryId: '', price: '', currentStock: '', barcode: '' });
            setImageFile(null);
            setImagePreview(null);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.modelName.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
    );

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12"> {/* Increased margin to mb-12 */}
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Product Inventory</h1>
                    <p className="text-gray-500">Manage and track your mobile stock levels</p>
                </div>
                {user.role === 'admin' && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                        <Plus size={20} /> <span className="font-bold">Add New Product</span>
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search className="text-gray-400" size={20} />
                <input
                    placeholder="Search by Brand, Model, Barcode..."
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '1rem', outline: 'none' }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-app)' }}>
                                <th className="p-4 text-left font-bold text-gray-700">IMAGE</th>
                                <th className="p-4 text-left font-bold text-gray-700">MODEL & BRAND</th>
                                <th className="p-4 text-left font-bold text-gray-700">CATEGORY</th>
                                <th className="p-4 text-left font-bold text-gray-700">UNIT PRICE</th>
                                <th className="p-4 text-left font-bold text-gray-700">STOCK</th>
                                <th className="p-4 text-left font-bold text-gray-700">STATUS</th>
                                {user.role === 'admin' && <th className="p-4 text-right font-bold text-gray-700">ACTIONS</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={user.role === 'admin' ? 7 : 6} className="p-12 text-center text-gray-400">Loading inventory...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={user.role === 'admin' ? 7 : 6} className="p-12 text-center text-gray-400">No products found matching your search.</td>
                                </tr>
                            ) : (
                                filteredProducts.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            {p.imageUrl ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${p.imageUrl}`}
                                                    alt={p.modelName}
                                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', background: '#f8fafc' }}
                                                />
                                            ) : (
                                                <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                    <Package size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{p.modelName}</div>
                                            <div className="text-xs text-gray-500">{p.brand} {p.barcode ? `• ${p.barcode}` : ''}</div>
                                        </td>
                                        <td className="p-4">
                                            <span style={{ padding: '4px 8px', background: 'var(--primary-light)', color: 'var(--primary-text)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {p.Category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">৳{p.price.toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{p.currentStock}</span>
                                                <span className="text-xs text-gray-400">pcs</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${p.status === 'Available' ? 'badge-success' : p.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`} style={{ borderRadius: '8px' }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        {user.role === 'admin' && (
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={() => handleDelete(p.id)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '2rem', animation: 'slideUp 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900">Add New Product</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                                {imagePreview ? (
                                    <div className="relative w-full h-32">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Click to upload product image</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Brand</label>
                                    <input placeholder="e.g. Apple" className="input" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Model Name</label>
                                    <input placeholder="e.g. iPhone 15" className="input" required value={formData.modelName} onChange={e => setFormData({ ...formData, modelName: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-1 block">Category</label>
                                <select className="input" required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Unit Price (৳)</label>
                                    <input type="number" placeholder="0.00" className="input" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Initial Stock</label>
                                    <input type="number" placeholder="0" className="input" required value={formData.currentStock} onChange={e => setFormData({ ...formData, currentStock: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-1 block">Barcode / IMEI (Optional)</label>
                                <input placeholder="Scan or enter barcode" className="input" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="btn" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
