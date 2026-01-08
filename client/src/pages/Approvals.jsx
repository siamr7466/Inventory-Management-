import { useEffect, useState } from 'react';
import api from '../api';
import { Check, X } from 'lucide-react';

export default function Approvals() {
    const [requests, setRequests] = useState([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data } = await api.get('/approval/pending');
        setRequests(data);
    };

    const handleAction = async (requestId, action) => {
        try {
            await api.post('/approval/action', { requestId, action });
            loadData();
        } catch (err) { alert(err.response?.data?.error); }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Pending Approvals</h1>

            {requests.length === 0 ? (
                <div className="card text-center text-gray-500 py-10">No pending approvals</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                            <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-600">Requester</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Action</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Product</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Quantity</th>
                                    <th className="p-4 text-right font-semibold text-gray-600">Decide</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="p-4 font-medium">{r.Requester.name}</td>
                                        <td className="p-4">
                                            <span className={`badge ${r.type === 'IN' ? 'badge-success' : 'badge-danger'}`}>STOCK {r.type}</span>
                                        </td>
                                        <td className="p-4 text-gray-600">{r.Product.brand} {r.Product.modelName}</td>
                                        <td className="p-4 font-bold">{r.quantity}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={() => handleAction(r.id, 'APPROVED')}><Check size={18} /></button>
                                            <button className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => handleAction(r.id, 'REJECTED')}><X size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
