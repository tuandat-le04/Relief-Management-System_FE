import React from 'react';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import Card from '../../components/Common/Card';

const ManagerDashboard = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar role="MANAGER" />
                <main className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Total Vehicles</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Available Vehicles</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">12</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Low Stock Items</h3>
                            <p className="text-3xl font-bold text-red-600 mt-2">5</p>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ManagerDashboard;
