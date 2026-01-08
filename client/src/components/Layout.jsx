import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="flex-1 flex flex-col md-ml-250 transition-all duration-300" style={{ width: '100%' }}>
                {/* Mobile Header */}
                <div className="md-hidden flex items-center p-4 bg-white border-b border-gray-200 justify-between sticky top-0 z-30">
                    <div className="flex items-center">
                        <button onClick={() => setMobileOpen(true)} className="p-2 ml-2 rounded hover:bg-gray-100" style={{ marginLeft: '-0.5rem' }}>
                            <Menu size={24} color="var(--text-main)" />
                        </button>
                        <span className="ml-2 font-bold text-lg text-primary">INVENTORY</span>
                    </div>
                    {/* Could add user profile pic here for mobile too */}
                </div>

                <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
