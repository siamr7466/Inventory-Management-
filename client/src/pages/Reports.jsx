import { useEffect, useState } from 'react';
import api from '../api';
import { ArrowUpRight, ArrowDownLeft, FileText, Download, Filter, Search, Calendar, ChevronDown, FileSpreadsheet, File } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';


export default function Reports() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('total'); // total, weekly, monthly


    useEffect(() => {
        api.get('/transactions').then(res => {
            setTransactions(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const [showExport, setShowExport] = useState(false);
    const exportRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setShowExport(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTransactions = transactions.filter(t => {
        if (timeRange === 'total') return true;
        const transDate = new Date(t.date);
        const now = new Date();
        if (timeRange === 'weekly') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transDate >= weekAgo;
        }
        if (timeRange === 'monthly') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return transDate >= monthAgo;
        }
        return true;
    });

    const exportToCSV = () => {
        if (filteredTransactions.length === 0) return;


        const headers = ["DATE & TIME", "MOVEMENT", "PRODUCT", "QTY", "UNIT PRICE", "TOTAL", "PROFIT/LOSS", "EXECUTED BY"];
        const rows = filteredTransactions.map(t => {
            const up = t.unitPrice || (t.type === 'IN' ? t.Product?.costPrice : t.Product?.price) || 0;
            const cost = t.costPriceAtTime || t.Product?.costPrice || 0;
            const profit = t.type === 'OUT' ? (up - cost) * t.quantity : 0;
            const margin = cost > 0 ? ((profit / (cost * t.quantity)) * 100).toFixed(1) : '0.0';


            return [
                `"${new Date(t.date).toLocaleDateString()} ${new Date(t.date).toLocaleTimeString()}"`,
                `STOCK ${t.type}`,
                `"${t.Product?.brand} ${t.Product?.modelName} (ID: #${t.productId})"`,
                `"${t.quantity} pcs"`,
                `"৳${up} (${t.type === 'IN' ? 'Cost' : 'Sale'})"`,
                `৳${up * t.quantity}`,
                t.type === 'OUT' ? `"৳${profit} (${margin}%)"` : '"Stock Entry"',
                `"${t.User?.name || 'System'} (${t.User?.role || 'System'})"`
            ];
        });


        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `inventory_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExport(false);
    };

    const exportToPDF = () => {
        if (filteredTransactions.length === 0) return;


        const doc = new jsPDF();

        // Report Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("Inventory Transaction Report", 14, 20);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

        const tableColumn = ["DATE & TIME", "MOVEMENT", "PRODUCT", "QTY", "UNIT PRICE", "TOTAL", "PROFIT/LOSS", "EXECUTED BY"];
        const tableRows = filteredTransactions.map(t => {
            const up = t.unitPrice || (t.type === 'IN' ? t.Product?.costPrice : t.Product?.price) || 0;
            const cost = t.costPriceAtTime || t.Product?.costPrice || 0;
            const profit = t.type === 'OUT' ? (up - cost) * t.quantity : 0;
            const margin = cost > 0 ? ((profit / (cost * t.quantity)) * 100).toFixed(1) : '0.0';


            return [
                `${new Date(t.date).toLocaleDateString()}\n${new Date(t.date).toLocaleTimeString()}`,
                `STOCK ${t.type}`,
                `${t.Product?.brand} ${t.Product?.modelName}\nID: #${t.productId}`,
                `${t.quantity} pcs`,
                `৳${up.toLocaleString()}\n(${t.type === 'IN' ? 'Cost' : 'Sale'})`,
                `৳${(up * t.quantity).toLocaleString()}`,
                t.type === 'OUT' ? `৳${profit.toLocaleString()}\n(${margin}%)` : 'Stock Entry',
                `${t.User?.name || 'System'}\n${t.User?.role || 'System'}`
            ];
        });




        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            headStyles: {
                fillColor: [15, 23, 42], // Deep Navy matching app
                textColor: 255,
                fontSize: 8,
                fontStyle: 'bold',
                cellPadding: 4
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 4,
                textColor: 40
            },
            columnStyles: {
                0: { cellWidth: 28 },
                1: { cellWidth: 22, fontStyle: 'bold' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
                4: { cellWidth: 22 },
                5: { cellWidth: 25, fontStyle: 'bold' },
                6: { cellWidth: 25, fontStyle: 'bold' },
                7: { cellWidth: 22 }
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            styles: {
                overflow: 'linebreak',
                valign: 'middle'
            }
        });

        doc.save(`${timeRange}_inventory_report_${new Date().toISOString().split('T')[0]}.pdf`);

        setShowExport(false);
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
                <div className="flex items-center gap-4">
                    <div style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
                        {['total', 'weekly', 'monthly'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em',
                                    transition: 'all 0.2s ease',
                                    background: timeRange === range ? 'var(--text-main)' : 'transparent',
                                    color: timeRange === range ? 'var(--bg-card)' : 'var(--text-muted)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <div className="relative" ref={exportRef}>
                        <button
                            className="btn flex items-center gap-2"
                            onClick={() => setShowExport(!showExport)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                background: 'var(--text-main)',
                                color: 'var(--bg-card)',
                                fontWeight: 700
                            }}
                        >
                            <Download size={20} /> <span>Export Logs</span> <ChevronDown size={16} className={`transition-transform ${showExport ? 'rotate-180' : ''}`} />
                        </button>

                        {showExport && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden py-1 animate-fadeIn z-50" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                <button
                                    onClick={exportToCSV}
                                    className="w-full text-left px-4 py-3 text-xs font-extrabold text-main hover:bg-app transition-colors flex items-center gap-3"
                                >
                                    <FileSpreadsheet size={16} className="text-emerald" /> Export as CSV
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full text-left px-4 py-3 text-xs font-extrabold text-main hover:bg-app transition-colors flex items-center gap-3 border-t"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <File size={16} className="text-danger" /> Export as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UNIT PRICE</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PROFIT/LOSS</th>
                                <th className="p-4 text-left font-bold" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXECUTED BY</th>



                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="loading-spinner"></div>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Fetching logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-16 text-center">
                                        <div className="flex flex-col items-center" style={{ color: 'var(--text-light)' }}>
                                            <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                            <p className="font-medium">No transactions found for this period.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(t => (

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
                                            <div className="font-bold text-xs" style={{ color: 'var(--text-main)' }}>৳{(t.unitPrice || (t.type === 'IN' ? t.Product?.costPrice : t.Product?.price) || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>({t.type === 'IN' ? 'Cost' : 'Sale'})</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-black text-sm" style={{ color: 'var(--text-main)' }}>৳{((t.unitPrice || (t.type === 'IN' ? t.Product?.costPrice : t.Product?.price) || 0) * t.quantity).toLocaleString()}</div>
                                        </td>

                                        <td className="p-4">
                                            {t.type === 'OUT' ? (
                                                (() => {
                                                    const profit = ((t.unitPrice || t.Product?.price || 0) - (t.costPriceAtTime || t.Product?.costPrice || 0)) * t.quantity;
                                                    return (
                                                        <>
                                                            <div className={`font-black text-sm ${profit >= 0 ? 'text-emerald' : 'text-danger'}`}>
                                                                {profit >= 0 ? '+' : ''}৳{profit.toLocaleString()}
                                                            </div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                                ({((profit / ((t.costPriceAtTime || t.Product?.costPrice || 1) * t.quantity)) * 100).toFixed(1)}%)
                                                            </div>
                                                        </>
                                                    );
                                                })()
                                            ) : (
                                                <span style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontStyle: 'italic' }}>Stock Entry</span>
                                            )}
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
        </div >
    );
}
