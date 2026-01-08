import { useEffect, useState } from 'react';
import api from '../api';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Reports() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        api.get('/transactions').then(res => setTransactions(res.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>Reports & Logs</h1>

            <div className="card mb-6">
                <h3 className="font-bold text-lg mb-4">Stock Transaction History</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-sm text-gray-500">{new Date(t.date).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {t.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{t.Product?.brand} {t.Product?.modelName}</td>
                                    <td className="p-4 font-medium">{t.quantity}</td>
                                    <td className="p-4 text-sm text-gray-500">{t.User?.name}</td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">No transactions recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
