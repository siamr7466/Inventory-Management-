import { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Sun, ChevronDown, CheckCircle, AlertCircle, Clock, X, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (e) { console.error('Failed to load notifications'); }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            loadNotifications();
        } catch (e) { console.error(e); }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={16} className="text-success" />;
            case 'WARNING': return <Clock size={16} className="text-warning" />;
            case 'DANGER': return <AlertCircle size={16} className="text-danger" />;
            default: return <Bell size={16} className="text-primary" />;
        }
    };

    return (
        <header className="sticky top-0 z-20 flex items-center justify-end px-6 py-3 transition-colors" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: '70px' }}>
            <div className="flex items-center gap-4">

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-app transition-colors"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={20} color="var(--text-muted)" /> : <Sun size={20} color="var(--warning-text)" />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 rounded-xl hover:bg-app transition-colors relative"
                    >
                        <Bell size={20} color="var(--text-muted)" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white flex items-center justify-center font-bold" style={{ fontSize: '10px', borderRadius: '50%', border: '2px solid var(--bg-card)' }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 max-h-[480px] overflow-hidden rounded-2xl shadow-xl animate-fadeIn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                            <div className="p-4 border-b flex justify-between items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                                <h4 className="font-extrabold text-sm whitespace-nowrap" style={{ color: 'var(--text-main)', margin: 0 }}>System Notifications</h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">{unreadCount} New</span>
                            </div>
                            <div className="overflow-y-auto max-h-[380px] custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center flex flex-col items-center gap-2">
                                        <Bell size={32} className="text-gray-300" />
                                        <p className="text-xs font-bold text-muted">All clear! No alerts.</p>
                                    </div>
                                ) : notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 border-b transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-app' : 'hover:bg-app'}`}
                                        style={{ borderColor: 'var(--border)' }}
                                        onClick={() => markAsRead(n.id)}
                                    >
                                        <div className="mt-1">{getIcon(n.type)}</div>
                                        <div className="flex-1">
                                            <div className="text-xs font-extrabold mb-1" style={{ color: 'var(--text-main)' }}>{n.title}</div>
                                            <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.message}</div>
                                            <div className="text-[9px] mt-2 font-bold uppercase opacity-50">{new Date(n.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl transition-all hover:bg-app"
                    >
                        <div className="text-right hidden sm:flex flex-col justify-center">
                            <div className="text-sm font-extrabold leading-tight mb-0.5" style={{ color: 'var(--text-main)' }}>{user.name}</div>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{user.role}</div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold shadow-md">
                            {user.name[0]}
                        </div>
                        <ChevronDown size={14} className={`text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-3 w-40 rounded-xl shadow-2xl overflow-hidden animate-slideDown" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                            <div className="p-1.5">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-danger hover:bg-danger-bg transition-all"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}


                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-app { background-color: var(--bg-app); }
                .text-muted { color: var(--text-muted); }
                .text-success { color: var(--success-text); }
                .text-warning { color: var(--warning-text); }
                .text-danger { color: var(--danger-text); }
                .bg-danger { background-color: var(--danger-text); }
                .bg-danger-bg { background-color: var(--danger-bg); }
            `}} />
        </header>
    );
}
