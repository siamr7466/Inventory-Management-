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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                        Pending Approvals
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Review and authorize inventory changes from your team</p>
                </div>
                <div className="badge badge-warning" style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} />
                    <span className="font-bold">{requests.length} REQUESTS WAITING</span>
                </div>
            </div>

            {loading ? (
                <div className="card text-center py-16" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col items-center gap-3">
                        <div className="loading-spinner"></div>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Fetching requests...</span>
                    </div>
                </div>
            ) : requests.length === 0 ? (
                <div className="card text-center p-16 animate-fadeIn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-center mb-6 w-20 h-20 items-center rounded-full mx-auto" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>
                        <ClipboardCheck size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Queue is Clear!</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', mx: 'auto' }}>There are no pending stock requests at the moment. Your inventory is up to date.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                                    <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REQUESTER</th>
                                    <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TYPE</th>
                                    <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRODUCT DETAILS</th>
                                    <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QUANTITY</th>
                                    <th className="p-4 text-right font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DECISION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold" style={{ color: 'var(--text-main)' }}>{r.Requester.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{new Date(r.createdAt).toLocaleString()}</div>
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
                                                <Package size={16} style={{ color: 'var(--text-light)' }} />
                                                <span className="font-bold" style={{ color: 'var(--text-main)' }}>{r.Product.brand} {r.Product.modelName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-extrabold text-lg" style={{ color: 'var(--text-main)' }}>
                                                {r.quantity} <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500, marginLeft: '4px' }}>pcs</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    className="btn flex items-center gap-2 hover:scale-105 transition-transform"
                                                    style={{ background: 'var(--success-bg)', color: 'var(--success-text)', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 700 }}
                                                    onClick={() => handleAction(r.id, 'APPROVED')}
                                                >
                                                    <Check size={18} /> <span>Approve</span>
                                                </button>
                                                <button
                                                    className="btn flex items-center gap-2 hover:scale-105 transition-transform"
                                                    style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 700 }}
                                                    onClick={() => handleAction(r.id, 'REJECTED')}
                                                >
                                                    <X size={18} /> <span>Reject</span>
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
                .table-row-hover:hover { background: var(--bg-app) !important; }
                .loading-spinner { width: 24px; height: 24px; border: 3px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
