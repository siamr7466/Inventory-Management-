import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

export default function StockOut() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            const endpoint = user.role === 'admin' ? '/stock/update' : '/approval/request';
            await api.post(endpoint, {
                productId: selectedProduct.id,
                quantity: parseInt(quantity),
                type: 'OUT'
            });
            alert(user.role === 'admin' ? 'Stock updated successfully' : 'Request submitted successfully');
            setQuantity('');
            setSelectedProduct(null);
            setSearch('');
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const filtered = products.filter(p => p.modelName.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Stock Out (Sales)</h1>

            <div className="card">
                <div className="mb-4">
                    <label className="block mb-2 font-medium">Select Product</label>
                    {!selectedProduct ? (
                        <div>
                            <div className="flex items-center gap-2 p-2 border rounded mb-2">
                                <Search size={18} />
                                <input className="outline-none w-full" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="border rounded max-h-40 overflow-y-auto">
                                {filtered.map(p => (
                                    <div key={p.id} className="p-2 hover:bg-gray-100 cursor-pointer border-b" onClick={() => { setSelectedProduct(p); setSearch(''); }}>
                                        <div className="font-medium">{p.brand} {p.modelName}</div>
                                        <div className="text-xs text-gray-500">Stock: {p.currentStock}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 rounded flex justify-between items-center border border-red-100">
                            <div>
                                <div className="font-bold">{selectedProduct.brand} {selectedProduct.modelName}</div>
                                <div className="text-sm text-gray-600">Current Stock: {selectedProduct.currentStock}</div>
                            </div>
                            <button className="text-sm text-red-600 underline" onClick={() => setSelectedProduct(null)}>Change</button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Quantity Sold</label>
                        <input type="number" className="input" min="1" required value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ background: 'var(--danger)' }} disabled={!selectedProduct}>
                        {user.role === 'admin' ? 'Reduce Stock' : 'Submit Sale Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
