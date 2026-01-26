import { useEffect, useState } from 'react';
import api from '../api';
import { ArrowUpRight, ArrowDownLeft, FileText, Download, Filter, Search, Calendar } from 'lucide-react';

export default function Reports() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/transactions').then(res => {
            setTransactions(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const downloadCSV = () => {
        alert("Preparing report download...");
        // In a real app, logic to convert JSON to CSV and download would go here
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                        Inventory Reports
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>History of all stock movements and sales</p>
                </div>
                <button
                    className="btn flex items-center gap-2"
                    onClick={downloadCSV}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        background: 'var(--text-main)',
                        color: 'var(--bg-card)',
                        fontWeight: 700
                    }}
                >
                    <Download size={20} /> <span>Export Logs</span>
                </button>
            </div>

            <div className="card mb-8" style={{ padding: '0px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-app)' }}>
                    <h3 className="font-extrabold text-lg flex items-center gap-2" style={{ color: 'var(--text-main)', margin: 0 }}>
                        <FileText size={20} style={{ color: 'var(--primary)' }} /> Stock Transaction History
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 transition-colors" style={{ background: 'transparent', color: 'var(--text-light)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}><Filter size={18} /></button>
                        <button className="p-2 transition-colors" style={{ background: 'transparent', color: 'var(--text-light)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}><Search size={18} /></button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DATE & TIME</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MOVEMENT</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRODUCT</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QTY</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXECUTED BY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="loading-spinner"></div>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Fetching logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center">
                                        <div className="flex flex-col items-center" style={{ color: 'var(--text-light)' }}>
                                            <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                            <p className="font-medium">No transactions recorded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                        <td className="p-4">
                                            <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{new Date(t.date).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{new Date(t.date).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${t.type === 'IN' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                                {t.type === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                STOCK {t.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold" style={{ color: 'var(--text-main)' }}>{t.Product?.brand} {t.Product?.modelName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{t.productId}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-extrabold text-lg" style={{ color: 'var(--text-main)' }}>{t.quantity} <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500 }}>pcs</span></div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{t.User?.name || 'System'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.User?.role}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
