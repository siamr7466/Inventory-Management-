import { useEffect, useState } from 'react';
import api from '../api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, CartesianGrid } from 'recharts';
import { Package, DollarSign, Layers, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Emerald, Amber, Red

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [range, setRange] = useState('7d');
    const [viewMode, setViewMode] = useState('value');

    useEffect(() => {
        api.get(`/dashboard/stats?range=${range}`).then(res => setStats(res.data)).catch(console.error);
    }, [range]);

    if (!stats) return (
        <div className="flex flex-col items-center justify-center p-24 w-full">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="mt-4 font-bold text-muted uppercase tracking-widest text-xs">Syncing...</div>
        </div>
    );

    const stockData = [
        { name: 'Available', value: stats.stockStatus.Available },
        { name: 'Low Stock', value: stats.stockStatus.LowStock },
        { name: 'Out of Stock', value: stats.stockStatus.OutOfStock },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>Real-time inventory and sales analytics.</p>
                </div>
                <select
                    className="input"
                    style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '12px' }}
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">Lifetime</option>
                </select>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Inventory Value" value={`৳${stats.stockValue.toLocaleString()}`} icon={<DollarSign size={22} />} color="emerald" trend="+8.4%" />
                <StatCard title="Total Products" value={stats.totalProducts} icon={<Package size={22} />} color="indigo" />
                <StatCard title="Total Stock Units" value={stats.totalStock.toLocaleString()} icon={<Layers size={22} />} color="purple" trend="+5.2%" />
                <StatCard title="Pending Review" value={stats.pendingApprovals} icon={<AlertCircle size={22} />} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <div className="card lg:col-span-2" style={{ padding: '2rem' }}>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                            <TrendingUp size={20} className="text-primary" /> Performance Analysis
                        </h3>

                        {/* Improved Toggle Switch */}
                        <div className="flex p-1 rounded-xl" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setViewMode('value')}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={{
                                    background: viewMode === 'value' ? 'var(--bg-card)' : 'transparent',
                                    color: viewMode === 'value' ? 'var(--primary)' : 'var(--text-muted)',
                                    boxShadow: viewMode === 'value' ? 'var(--shadow-sm)' : 'none',
                                    border: 'none',
                                    outline: 'none'
                                }}
                            >Value</button>
                            <button
                                onClick={() => setViewMode('units')}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={{
                                    background: viewMode === 'units' ? 'var(--bg-card)' : 'transparent',
                                    color: viewMode === 'units' ? 'var(--primary)' : 'var(--text-muted)',
                                    boxShadow: viewMode === 'units' ? 'var(--shadow-sm)' : 'none',
                                    border: 'none',
                                    outline: 'none'
                                }}
                            >Units</button>
                        </div>
                    </div>

                    <div style={{ height: '340px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => viewMode === 'value' ? `৳${val}` : val} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-hover)', padding: '12px', color: 'var(--text-main)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={viewMode === 'value' ? 'sales' : 'unitsSold'}
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    name={viewMode === 'value' ? 'Sales Revenue' : 'Units Sold'}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={viewMode === 'value' ? 'stock' : 'unitsAdded'}
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorStock)"
                                    name={viewMode === 'value' ? 'Stock Value' : 'Units Added'}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Health Chart */}
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="font-bold text-lg mb-8" style={{ color: 'var(--text-main)' }}>Stock Health</h3>

                    <div style={{ height: '220px', position: 'relative', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stockData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Perfectly Centered Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{stats.totalProducts}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>SKUs</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-10">
                        {stockData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: 10, height: 10, borderRadius: '3px', background: COLORS[index % COLORS.length] }}></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{entry.value}</span>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', opacity: 0.8 }}>Items</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}

function StatCard({ title, value, icon, color, trend }) {
    const colors = {
        indigo: { text: '#818cf8', light: 'rgba(129, 140, 248, 0.12)' },
        purple: { text: '#a78bfa', light: 'rgba(167, 139, 250, 0.12)' },
        emerald: { text: '#10b981', light: 'rgba(16, 185, 129, 0.12)' },
        amber: { text: '#f59e0b', light: 'rgba(245, 158, 11, 0.12)' },
    };

    const c = colors[color] || colors.indigo;

    return (
        <div className="card hover:scale-[1.02] transition-transform duration-300" style={{ padding: '1.75rem' }}>
            <div className="flex justify-between items-start mb-5">
                <div style={{ padding: '0.8rem', borderRadius: '14px', background: c.light, color: c.text, display: 'flex' }}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>
                        <ArrowUpRight size={14} strokeWidth={2.5} /> {trend}
                    </div>
                )}
            </div>
            <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: 'var(--text-muted)' }}>{title}</div>
                <div className="text-2xl font-black" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</div>
            </div>
        </div>
    );
}
