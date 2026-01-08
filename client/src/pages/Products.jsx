import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Edit } from 'lucide-react';

export default function Products() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ brand: '', modelName: '', categoryId: '', price: '', currentStock: '', barcode: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
        setProducts(pRes.data);
        setCategories(cRes.data);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            await api.delete(`/products/${id}`);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', formData);
            setShowModal(false);
            setFormData({ brand: '', modelName: '', categoryId: '', price: '', currentStock: '', barcode: '' });
            loadData();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const filteredProducts = products.filter(p =>
        p.modelName.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Products</h1>
                {user.role === 'admin' && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Product
                    </button>
                )}
            </div>

            <div className="card mb-6">
                <div className="flex items-center gap-2 p-2 border rounded" style={{ maxWidth: '400px' }}>
                    <Search size={20} className="text-gray-400" />
                    <input
                        placeholder="Search by Brand, Model, Barcode..."
                        className="w-full outline-none"
                        style={{ border: 'none' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th className="p-4 text-left font-semibold text-gray-600">Model</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Brand</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Category</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Price</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Stock</th>
                                <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                                {user.role === 'admin' && <th className="p-4 text-right font-semibold text-gray-600">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className="p-4 font-medium">{p.modelName}</td>
                                    <td className="p-4 text-gray-500">{p.brand}</td>
                                    <td className="p-4 text-gray-500">{p.Category?.name || '-'}</td>
                                    <td className="p-4 font-medium">${p.price}</td>
                                    <td className="p-4">{p.currentStock}</td>
                                    <td className="p-4">
                                        <span className={`badge ${p.status === 'Available' ? 'badge-success' : p.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    {user.role === 'admin' && (
                                        <td className="p-4 text-right">
                                            <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}><Trash2 size={18} /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h2 className="text-xl font-bold mb-4">Add Product</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                <input placeholder="Brand" className="input" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                <input placeholder="Model Name" className="input" required value={formData.modelName} onChange={e => setFormData({ ...formData, modelName: e.target.value })} />
                            </div>
                            <select className="input" required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                <input type="number" placeholder="Price" className="input" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                <input type="number" placeholder="Initial Stock" className="input" required value={formData.currentStock} onChange={e => setFormData({ ...formData, currentStock: e.target.value })} />
                            </div>
                            <input placeholder="Barcode" className="input" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="btn" style={{ background: '#f3f4f6' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
