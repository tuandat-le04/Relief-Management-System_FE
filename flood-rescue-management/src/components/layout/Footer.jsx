import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-4 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm">
                    © {new Date().getFullYear()} Flood Rescue Management System. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
