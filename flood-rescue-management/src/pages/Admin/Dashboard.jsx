import React from 'react';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import Card from '../../components/Common/Card';

const AdminDashboard = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar role="ADMIN" />
                <main className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">156</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">142</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">System Health</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">98%</p>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
