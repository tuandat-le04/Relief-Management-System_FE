import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">
                    Flood Rescue Management
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-sm">Welcome, {user.name || 'User'}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
