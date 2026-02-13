import { useEffect, useState } from 'react';
import api from '../api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, CartesianGrid } from 'recharts';
import { Package, DollarSign, Layers, AlertCircle, TrendingUp, ArrowUpRight, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Emerald, Amber, Red

export default function Dashboard() {
    const { user } = useAuth();
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
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '4rem' }}>
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
                    <option value="12m">Last 12 Months</option>
                    <option value="all">Lifetime</option>
                </select>
            </div>

            {/* Main Stat Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
                <StatCard title="Inventory Value (Sale)" value={`৳${stats.stockValue.toLocaleString()}`} icon={<DollarSign size={24} />} color="emerald" />
                <StatCard title="Total Products" value={stats.totalProducts} icon={<Package size={24} />} color="indigo" />
                <StatCard title="Total Units" value={stats.totalStock.toLocaleString()} icon={<Layers size={24} />} color="purple" />
                <StatCard title="Pending Review" value={stats.pendingApprovals} icon={<AlertCircle size={24} />} color="amber" />
            </div>

            {/* Financial Performance Section */}
            <div className="mb-14">
                <div className="flex items-center gap-3 mb-8">
                    <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                        <TrendingUp size={22} />
                    </div>
                    <h3 className="font-bold text-2xl" style={{ color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>Financial Summary</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div className="card hover:translate-y-[-4px] transition-all card-padding" style={{ borderLeft: '6px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="text-[11px] font-bold text-muted uppercase tracking-[0.12em] mb-1">Total Sold (Revenue)</div>
                        <div className="text-3xl font-black text-main" style={{ letterSpacing: '-0.03em' }}>৳{stats.financials?.revenue?.toLocaleString() || 0}</div>
                        <div className="text-[12px] font-bold text-emerald mt-1" style={{ color: '#10b981' }}>{stats.financials?.unitsSold || 0} units processed</div>
                    </div>

                    <div className="card hover:translate-y-[-4px] transition-all card-padding" style={{ borderLeft: '6px solid #6366f1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="text-[11px] font-bold text-muted uppercase tracking-[0.12em] mb-1">Total Bought (Investment)</div>
                        <div className="text-3xl font-black text-main" style={{ letterSpacing: '-0.03em' }}>৳{stats.financials?.investment?.toLocaleString() || 0}</div>
                        <div className="text-[12px] font-bold text-muted mt-1">Stock acquired in period</div>
                    </div>

                    <div className="card hover:translate-y-[-4px] transition-all card-padding" style={{ borderLeft: '6px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="text-[11px] font-bold text-muted uppercase tracking-[0.12em] mb-1">Remaining Stock (Cost)</div>
                        <div className="text-3xl font-black text-main" style={{ letterSpacing: '-0.03em' }}>৳{stats.inventoryCostValue?.toLocaleString() || 0}</div>
                        <div className="text-[12px] font-bold text-muted mt-1">Current assets at cost</div>
                    </div>

                    <div className="card hover:translate-y-[-4px] transition-all card-padding" style={{
                        borderLeft: `6px solid ${(stats.financials?.profit || 0) >= 0 ? '#10b981' : '#ef4444'}`,
                        background: (stats.financials?.profit || 0) >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: (stats.financials?.profit || 0) >= 0 ? '#065f46' : '#991b1b', opacity: 0.8 }}>Net Profit / Loss</div>
                        <div className="text-3xl font-black" style={{ color: (stats.financials?.profit || 0) >= 0 ? '#065f46' : '#991b1b', letterSpacing: '-0.03em' }}>
                            {(stats.financials?.profit || 0) >= 0 ? '+' : ''}৳{(stats.financials?.profit || 0).toLocaleString()}
                        </div>
                        <div className="text-[12px] font-bold mt-1" style={{ color: (stats.financials?.profit || 0) >= 0 ? '#047857' : '#b91c1c' }}>
                            {(stats.financials?.profit || 0) >= 0 ? 'Profitable Performance' : 'Loss in Transactions'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Progress Section for Employees */}
            {user.role !== 'admin' && stats.monthlyStats && (
                <SalesProgress stats={stats.monthlyStats} />
            )}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 section-gap">
                {/* Performance Chart */}
                <div className="card lg:col-span-2 card-padding">
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

                    <div style={{ height: '340px', marginBottom: '1.5rem' }}>
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
                <div className="card card-padding" style={{ display: 'flex', flexDirection: 'column' }}>
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

function SalesProgress({ stats }) {
    const { unitsSold, revenue, target } = stats;

    // Progress for Units
    const unitTarget = target?.units || 0;
    const unitPercentage = unitTarget > 0 ? Math.min((unitsSold / unitTarget) * 100, 100) : 0;
    const unitsRemaining = Math.max(unitTarget - unitsSold, 0);

    // Progress for Value
    const valTarget = target?.value || 0;
    const valPercentage = valTarget > 0 ? Math.min((revenue / valTarget) * 100, 100) : 0;
    const valRemaining = Math.max(valTarget - revenue, 0);

    return (
        <div className="mb-10 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
                <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)', display: 'flex' }}>
                    <Target size={20} />
                </div>
                <h3 className="font-bold text-xl" style={{ color: 'var(--text-main)', margin: 0 }}>Monthly Sales Targets</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Units Progress */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">UNITS SOLD</div>
                            <div className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>{unitsSold} <span style={{ fontSize: '12px', opacity: 0.5 }}>/ {unitTarget || 'No Target'}</span></div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{Math.round(unitPercentage)}% COMPLETE</div>
                        </div>
                    </div>

                    <div style={{ height: '10px', background: 'var(--bg-app)', borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ width: `${unitPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #818cf8)', transition: 'width 1s var(--ease)' }}></div>
                    </div>

                    {unitTarget > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: unitsRemaining === 0 ? 'var(--success-text)' : 'var(--text-muted)' }}>
                            {unitsRemaining === 0 ? <CheckCircle2 size={14} className="text-success" /> : <ChevronRight size={14} />}
                            {unitsRemaining === 0 ? 'Monthly Target Achieved!' : `Sell ${unitsRemaining} more units to reach goal`}
                        </div>
                    )}
                </div>

                {/* Revenue Progress */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">REVENUE GENERATED</div>
                            <div className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>৳{revenue.toLocaleString()} <span style={{ fontSize: '12px', opacity: 0.5 }}>/ ৳{(valTarget || 0).toLocaleString()}</span></div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-emerald uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>{Math.round(valPercentage)}% COMPLETE</div>
                        </div>
                    </div>

                    <div style={{ height: '10px', background: 'var(--bg-app)', borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ width: `${valPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 1s var(--ease)' }}></div>
                    </div>

                    {valTarget > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: valRemaining === 0 ? 'var(--success-text)' : 'var(--text-muted)' }}>
                            {valRemaining === 0 ? <CheckCircle2 size={14} className="text-success" /> : <ChevronRight size={14} />}
                            {valRemaining === 0 ? 'Revenue Target Achieved!' : `Generate ৳${Math.round(valRemaining).toLocaleString()} more to reach goal`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

