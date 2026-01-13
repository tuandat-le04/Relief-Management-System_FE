import React from 'react';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import Card from '../../components/Common/Card';

const RescueTeamDashboard = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar role="RESCUE_TEAM" />
                <main className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-3xl font-bold mb-6">Rescue Team Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Assigned Tasks</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">5</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
                            <p className="text-3xl font-bold text-orange-600 mt-2">2</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-700">Completed Today</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">3</p>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default RescueTeamDashboard;
