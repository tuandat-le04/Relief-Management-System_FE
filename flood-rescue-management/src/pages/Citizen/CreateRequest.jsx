import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import Footer from '../../components/Layout/Footer';
import Card from '../../components/Common/Card';
import RequestForm from '../../components/Citizen/RequestForm';
import { rescueRequestAPI } from '../../api/apiService';

const CreateRequest = () => {
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            await rescueRequestAPI.create(formData);
            alert('Request created successfully!');
            navigate('/citizen/dashboard');
        } catch (error) {
            alert('Failed to create request');
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar role="CITIZEN" />
                <main className="flex-1 p-6 bg-gray-100">
                    <h1 className="text-3xl font-bold mb-6">Create Rescue Request</h1>
                    <Card className="max-w-2xl">
                        <RequestForm onSubmit={handleSubmit} />
                    </Card>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default CreateRequest;
