import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, MinusCircle, Package, ShoppingCart } from 'lucide-react';

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
        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Stock Out (Sales)</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Record sales and reduce product inventory</p>
                <div className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-warning'} mt-4`}>
                    {user.role === 'admin' ? 'ADMIN MODE' : 'EMPLOYEE MODE'}
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>1. Select Product Sold</label>

                        {/* Search Bar Section - Perfectly Centered Left Icon */}
                        <div className="relative mb-4 group focus-within:text-[var(--danger-text)] transition-colors" style={{ color: 'var(--text-light)' }}>
                            <div style={{ position: 'absolute', left: '14px', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                <Search size={18} style={{ color: 'inherit' }} />
                            </div>
                            <input
                                className="input"
                                style={{ paddingLeft: '42px', background: 'var(--bg-app)', height: '48px', fontSize: '0.9rem' }}
                                placeholder="Search by brand or model..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {selectedProduct ? (
                            <div className="p-3 border rounded-xl flex justify-between items-center" style={{ borderColor: 'var(--secondary)', background: 'var(--secondary-light)' }}>
                                <div>
                                    <div className="font-bold" style={{ color: 'var(--secondary)' }}>{selectedProduct.brand} {selectedProduct.modelName}</div>
                                    <div className="text-xs" style={{ color: 'var(--secondary)', opacity: 0.8 }}>Available: {selectedProduct.currentStock} pcs</div>
                                </div>
                                <button className="text-xs font-bold underline transition-opacity hover:opacity-70" onClick={() => setSelectedProduct(null)}>Change</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="text-center py-4 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Loading products...</div>
                                ) : filtered.length === 0 ? (
                                    <div className="text-center py-4 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>No products found</div>
                                ) : filtered.map(p => (
                                    <div
                                        key={p.id}
                                        className="p-3 border rounded-xl cursor-pointer hover:border-[var(--secondary)] transition-all flex items-center justify-between group"
                                        style={{ borderColor: 'var(--border)', background: 'var(--bg-app)' }}
                                        onClick={() => setSelectedProduct(p)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="transition-colors group-hover:bg-[var(--secondary-light)]" style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <Package size={16} style={{ color: 'var(--secondary)' }} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{p.brand} {p.modelName}</div>
                                                <div className="text-[10px]" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Available: {p.currentStock} pcs</div>
                                            </div>
                                        </div>
                                        <MinusCircle size={18} className="text-gray-300 group-hover:text-[var(--secondary)] transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>2. Sale Details</label>
                        <input
                            type="number"
                            className="input"
                            style={{ height: '48px', background: 'var(--bg-app)', borderColor: selectedProduct ? 'var(--secondary)' : 'var(--border)' }}
                            placeholder="Quantity Sold (pcs)"
                            min="1"
                            max={selectedProduct?.currentStock}
                            required
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-full h-[48px] rounded-xl font-bold transition-all hover:scale-[1.01]"
                        style={{
                            background: 'var(--secondary)',
                            color: 'white',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        disabled={!selectedProduct}
                    >
                        <ShoppingCart size={18} className="mr-2 inline-block" />
                        {user.role === 'admin' ? 'Confirm Sale' : 'Request Sale'}
                    </button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
