import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
    const location = useLocation();

    const menuItems = {
        CITIZEN: [
            { path: '/citizen/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/citizen/create-request', label: 'Create Request', icon: '➕' },
        ],
        RESCUE_TEAM: [
            { path: '/rescue-team/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/rescue-team/tasks', label: 'My Tasks', icon: '📋' },
        ],
        COORDINATOR: [
            { path: '/coordinator/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/coordinator/requests', label: 'Manage Requests', icon: '📝' },
        ],
        MANAGER: [
            { path: '/manager/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/manager/vehicles', label: 'Vehicles', icon: '🚗' },
            { path: '/manager/supplies', label: 'Supplies', icon: '📦' },
        ],
        ADMIN: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
            { path: '/admin/users', label: 'Users', icon: '👥' },
            { path: '/admin/roles', label: 'Roles', icon: '🔐' },
        ],
    };

    const items = menuItems[role] || [];

    return (
        <aside className="w-64 bg-gray-800 text-white min-h-screen">
            <nav className="p-4">
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname === item.path
                                        ? 'bg-blue-600'
                                        : 'hover:bg-gray-700'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
