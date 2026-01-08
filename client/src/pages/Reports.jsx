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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                        Inventory Reports
                    </h1>
                    <p className="text-gray-500">History of all stock movements and sales</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2" onClick={downloadCSV} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'var(--text-main)', color: 'white' }}>
                    <Download size={20} /> <span className="font-bold">Export Logs</span>
                </button>
            </div>

            <div className="card mb-8" style={{ padding: '0px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-primary" /> Stock Transaction History
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Filter size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Search size={18} /></button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-app)' }}>
                                <th className="p-4 text-left font-bold text-gray-700">DATE & TIME</th>
                                <th className="p-4 text-left font-bold text-gray-700">MOVEMENT</th>
                                <th className="p-4 text-left font-bold text-gray-700">PRODUCT</th>
                                <th className="p-4 text-left font-bold text-gray-700">QTY</th>
                                <th className="p-4 text-left font-bold text-gray-700">EXECUTED BY</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center text-gray-400">Fetching logs...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <Calendar size={48} className="mb-4 opacity-20" />
                                            <p className="font-medium">No transactions recorded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-gray-900">{new Date(t.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-lg w-fit ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {t.type === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                STOCK {t.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{t.Product?.brand} {t.Product?.modelName}</div>
                                            <div className="text-xs text-gray-500">ID: #{t.productId}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-extrabold text-lg">{t.quantity} <span className="text-xs text-gray-400 font-medium">pcs</span></div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-medium text-gray-700">{t.User?.name || 'System'}</div>
                                            <div className="text-xs text-gray-400 capitalize">{t.User?.role}</div>
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
            `}} />
        </div>
    );
}
