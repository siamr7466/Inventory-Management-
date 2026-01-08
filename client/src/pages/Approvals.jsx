import { useEffect, useState } from 'react';
import api from '../api';
import { Check, X, ClipboardCheck, User, Package, Clock, AlertCircle } from 'lucide-react';

export default function Approvals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/approval/pending');
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            await api.post('/approval/action', { requestId, action });
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || "Action failed");
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        Pending Approvals
                    </h1>
                    <p className="text-gray-500">Review and authorize inventory changes from your team</p>
                </div>
                <div className="badge badge-warning" style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    <span className="font-bold">{requests.length} REQUESTS WAITING</span>
                </div>
            </div>

            {loading ? (
                <div className="card text-center text-gray-400 py-16">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-gray-100 rounded"></div>
                    </div>
                </div>
            ) : requests.length === 0 ? (
                <div className="card text-center p-16 animate-fadeIn">
                    <div className="flex justify-center mb-6 text-emerald-500 bg-emerald-50 w-20 h-20 items-center rounded-full mx-auto">
                        <ClipboardCheck size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Queue is Clear!</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">There are no pending stock requests at the moment. Your inventory is up to date.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-app)' }}>
                                    <th className="p-4 text-left font-bold text-gray-700">REQUESTER</th>
                                    <th className="p-4 text-left font-bold text-gray-700">TYPE</th>
                                    <th className="p-4 text-left font-bold text-gray-700">PRODUCT DETAILS</th>
                                    <th className="p-4 text-left font-bold text-gray-700">QUANTITY</th>
                                    <th className="p-4 text-right font-bold text-gray-700">DECISION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{r.Requester.name}</div>
                                                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${r.type === 'IN' ? 'badge-success' : 'badge-danger'}`} style={{ borderRadius: '6px', fontSize: '0.7rem' }}>
                                                STOCK {r.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Package size={16} className="text-gray-400" />
                                                <span className="font-medium text-gray-700">{r.Product.brand} {r.Product.modelName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-extrabold text-lg text-gray-900">
                                                {r.quantity} <span className="text-xs text-gray-400 font-medium ml-1">pcs</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    className="btn flex items-center gap-2"
                                                    style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '10px' }}
                                                    onClick={() => handleAction(r.id, 'APPROVED')}
                                                >
                                                    <Check size={18} /> <span className="font-bold">Approve</span>
                                                </button>
                                                <button
                                                    className="btn flex items-center gap-2"
                                                    style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: '10px' }}
                                                    onClick={() => handleAction(r.id, 'REJECTED')}
                                                >
                                                    <X size={18} /> <span className="font-bold">Reject</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
