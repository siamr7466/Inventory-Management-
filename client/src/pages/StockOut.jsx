import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, MinusCircle, Package, ArrowLeft, CheckCircle, Shield, User, ShoppingCart } from 'lucide-react';

export default function StockOut() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products').then(res => {
            setProducts(res.data);
            setLoading(false);
        });
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
            alert(user.role === 'admin' ? 'Stock reduced (Sale logged) successfully!' : 'Sale request submitted for approval.');
            setQuantity('');
            setSelectedProduct(null);
            setSearch('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to process sale');
        }
    };

    const filtered = products.filter(p =>
        p.modelName.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        Stock Out (Sales)
                    </h1>
                    <p className="text-gray-500">Record sales and reduce product inventory</p>
                </div>
                <div className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                    <span className="font-bold">{user.role.toUpperCase()} MODE</span>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                <div className="mb-8">
                    <label className="text-sm font-extrabold text-gray-700 mb-3 block">1. SELECT PRODUCT SOLD</label>
                    {!selectedProduct ? (
                        <div className="flex flex-col gap-4">
                            <div className="card" style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
                                <Search size={20} className="text-gray-400" />
                                <input
                                    className="outline-none w-full bg-transparent"
                                    placeholder="Search by model or brand..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="text-center p-8 text-gray-400">Loading products...</div>
                                ) : filtered.length === 0 ? (
                                    <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl">No matching products found</div>
                                ) : filtered.map(p => (
                                    <div
                                        key={p.id}
                                        className="p-4 hover:bg-orange-50 cursor-pointer border border-transparent hover:border-orange-100 rounded-xl transition-all flex items-center justify-between group"
                                        onClick={() => { setSelectedProduct(p); setSearch(''); }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div style={{ padding: '10px', background: 'white', borderRadius: '10px', shadow: 'var(--shadow-sm)' }}>
                                                <Package size={20} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 group-hover:text-orange-700">{p.brand} {p.modelName}</div>
                                                <div className="text-xs text-gray-500 font-medium">Available: {p.currentStock} units</div>
                                            </div>
                                        </div>
                                        <MinusCircle size={20} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 bg-orange-50 rounded-2xl flex justify-between items-center border border-orange-100 shadow-sm animate-slideIn">
                            <div className="flex items-center gap-4">
                                <div style={{ padding: '12px', background: 'white', borderRadius: '12px' }}>
                                    <Package size={24} className="text-orange-600" />
                                </div>
                                <div>
                                    <div className="font-extrabold text-orange-900 text-lg">{selectedProduct.brand} {selectedProduct.modelName}</div>
                                    <div className="text-sm text-orange-600 font-bold">Current Stock: {selectedProduct.currentStock} units</div>
                                </div>
                            </div>
                            <button className="btn text-sm hover:bg-white p-2 rounded-xl transition-colors" onClick={() => setSelectedProduct(null)}>
                                <ArrowLeft size={16} className="mr-1" /> Change
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ opacity: selectedProduct ? 1 : 0.5, pointerEvents: selectedProduct ? 'auto' : 'none', transition: 'all 0.3s' }}>
                    <div className="mb-6">
                        <label className="text-sm font-extrabold text-gray-700 mb-3 block">2. SALE DETAILS</label>
                        <div className="flex flex-col gap-1">
                            <input
                                type="number"
                                className="input"
                                style={{ fontSize: '1.2rem', padding: '1rem', fontWeight: 700, borderColor: 'var(--danger-text)', color: 'var(--danger-text)' }}
                                placeholder="Quantity Sold (pcs)"
                                min="1"
                                max={selectedProduct?.currentStock}
                                required
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2 px-1">
                                {user.role === 'admin' ?
                                    'Performing this action will immediately reduce stock and update sales analytics.' :
                                    'This sale requires admin authorization before stock is reduced.'}
                            </p>
                        </div>
                    </div>
                    <button type="submit" className="btn w-full" style={{ padding: '1rem', borderRadius: '14px', fontSize: '1.1rem', background: '#ea580c', color: 'white' }} disabled={!selectedProduct}>
                        <ShoppingCart size={20} className="mr-2" />
                        {user.role === 'admin' ? 'Confirm Sale & Reduce Stock' : 'Submit Sale Request'}
                    </button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
}
