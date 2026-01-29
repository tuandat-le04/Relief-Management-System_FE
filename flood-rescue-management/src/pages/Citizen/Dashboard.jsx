import React, { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import Card from '../../components/Common/Card';
import { rescueRequestAPI } from '../../api/apiService';

const CitizenDashboard = () => {
    const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const requests = await rescueRequestAPI.getMyRequests();
            setStats({
                pending: requests.filter(r => r.status === 'PENDING').length,
                inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
                completed: requests.filter(r => r.status === 'COMPLETED').length,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar role="CITIZEN" />
                <main className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-3xl font-bold mb-6">Citizen Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Pending Requests</h3>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default CitizenDashboard;
