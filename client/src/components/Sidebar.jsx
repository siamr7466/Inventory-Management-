import { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ArrowUpCircle, ArrowDownCircle, CheckSquare, BarChart, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const location = useLocation();
    const { logout, user } = useAuth();

    const isActive = (path) => location.pathname === path;

    const links = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { label: 'Categories', path: '/categories', icon: <Tag size={20} /> },
        { label: 'Products', path: '/products', icon: <Package size={20} /> },
        { label: 'Stock In', path: '/stock-in', icon: <ArrowDownCircle size={20} /> },
        { label: 'Stock Out', path: '/stock-out', icon: <ArrowUpCircle size={20} /> },
        { label: 'Reports', path: '/reports', icon: <BarChart size={20} /> },
    ];

    if (user?.role === 'admin') {
        links.push({ label: 'Approvals', path: '/approvals', icon: <CheckSquare size={20} /> });
        links.push({ label: 'Settings', path: '/settings', icon: <Settings size={20} /> });
    }

    const linkStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        background: active ? 'var(--primary-light)' : 'transparent',
        marginBottom: '0.5rem',
        fontWeight: active ? 600 : 500,
        transition: 'all 0.2s',
        textDecoration: 'none'
    });

    return (
        <>
            {/* Mobile Overlay */}
            <div
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40,
                    opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease'
                }}
                onClick={() => setMobileOpen(false)}
                className="md-hidden" /* Only show overlay on mobile */
            />

            {/* Sidebar Container */}
            <div
                className="sidebar-desktop-visible"
                style={{
                    width: '260px',
                    background: 'var(--bg-sidebar)',
                    height: '100vh',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid var(--border)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 50,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: mobileOpen ? 'translateX(0)' : undefined, // Let CSS handle desktop default
                    boxShadow: 'var(--shadow-card)'
                }}
            >
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 800, fontSize: '1.4rem' }}>
                    <div className="flex items-center gap-2">
                        <div style={{ padding: '6px', background: 'var(--primary)', borderRadius: '8px', color: 'white', display: 'flex' }}>
                            <Package size={24} />
                        </div>
                        <span style={{ letterSpacing: '-0.03em' }}>INVENTORY</span>
                    </div>
                    <button className="md-hidden" onClick={() => setMobileOpen(false)} style={{ padding: '4px' }}>
                        <X size={24} color="var(--text-muted)" />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={linkStyle(isActive(link.path))}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span style={{ marginRight: '1rem', display: 'flex' }}>{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-app)', borderRadius: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem', fontWeight: 600, fontSize: '1rem' }}>
                            {user?.name?.[0]}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>{user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                    </div>
                    <button onClick={logout} style={{ ...linkStyle(false), width: '100%', color: 'var(--danger)', justifyContent: 'center', background: 'var(--danger-bg)' }}>
                        <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
