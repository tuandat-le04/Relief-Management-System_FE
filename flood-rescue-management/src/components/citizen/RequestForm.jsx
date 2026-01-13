import React, { useState } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';

const RequestForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        location: '',
        description: '',
        numberOfPeople: '',
        urgency: 'MEDIUM',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter location"
            />
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the situation..."
                />
            </div>
            <Input
                label="Number of People"
                name="numberOfPeople"
                type="number"
                value={formData.numberOfPeople}
                onChange={handleChange}
                required
            />
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level <span className="text-red-500">*</span>
                </label>
                <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>
            <Button type="submit" variant="primary" className="w-full">
                Submit Request
            </Button>
        </form>
    );
};

export default RequestForm;
