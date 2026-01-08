import { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, CartesianGrid } from 'recharts';
import { Package, DollarSign, Layers, AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Emerald, Amber, Red


export default function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
    }, []);

    if (!stats) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    const stockData = [
        { name: 'Available', value: stats.stockStatus.Available },
        { name: 'Low Stock', value: stats.stockStatus.LowStock },
        { name: 'Out of Stock', value: stats.stockStatus.OutOfStock },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>Dashboard</h1>
                    <p className="text-gray-500" style={{ marginTop: '0.25rem' }}>Overview of your inventory performance.</p>
                </div>
                <div className="md-hidden">
                    {/* Mobile specific actions if needed */}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Total Products" value={stats.totalProducts} icon={<Package size={24} />} color="indigo" trend="+12%" />
                <StatCard title="Total Stock Units" value={stats.totalStock} icon={<Layers size={24} />} color="purple" trend="+5%" />
                <StatCard title="Inventory Value" value={`৳${stats.stockValue.toLocaleString()}`} icon={<DollarSign size={24} />} color="emerald" trend="+8%" />
                <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={<AlertCircle size={24} />} color="amber" trend="" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Sales Trend Chart */}
                <div className="card col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" /> Sales Trend
                        </h3>
                        <select className="input" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div style={{ height: '320px' }}>
                        {stats.trendData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                                        formatter={(value) => `৳${value.toLocaleString()}`}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Sales Value" />
                                    <Area type="monotone" dataKey="stock" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorStock)" name="Stock Added Value" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">Loading Chart Data...</div>
                        )}
                    </div>
                </div>

                {/* Calculator & Pie Chart Column */}
                <div className="flex flex-col gap-6">

                    {/* Stock Status Pie Chart */}
                    <div className="card flex-1">
                        <h3 className="font-bold text-lg mb-6">Stock Health</h3>
                        <div style={{ height: '200px', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stockData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stockData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Quick Legend Overlay */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
                                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Items</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-4 flex-wrap">
                            {stockData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1.5">
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-xs font-medium text-gray-600">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, trend }) {
    const colors = {
        indigo: { bg: 'bg-indigo-50', text: '#4f46e5', light: '#eef2ff' },
        purple: { bg: 'bg-purple-50', text: '#9333ea', light: '#f3e8ff' },
        emerald: { bg: 'bg-emerald-50', text: '#10b981', light: '#ecfdf5' },
        amber: { bg: 'bg-amber-50', text: '#f59e0b', light: '#fffbeb' },
    };
    const c = colors[color] || colors.indigo;

    return (
        <div className="card relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-4">
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: c.light, color: c.text }}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <ArrowUpRight size={12} /> {trend}
                    </div>
                )}
            </div>
            <div>
                <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
        </div>
    )
}
