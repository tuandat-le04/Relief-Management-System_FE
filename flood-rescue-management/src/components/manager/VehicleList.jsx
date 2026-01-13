import React from 'react';
import Table from '../Common/Table';
import Button from '../Common/Button';

const VehicleList = ({ vehicles, onEdit, onDelete }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Type', dataIndex: 'type' },
        { title: 'License Plate', dataIndex: 'licensePlate' },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'AVAILABLE' ? 'bg-green-200 text-green-800' :
                        status === 'IN_USE' ? 'bg-blue-200 text-blue-800' :
                            'bg-red-200 text-red-800'
                    }`}>
                    {status}
                </span>
            )
        },
        { title: 'Capacity', dataIndex: 'capacity' },
        {
            title: 'Actions',
            dataIndex: 'id',
            render: (id, record) => (
                <div className="flex gap-2">
                    <Button variant="primary" onClick={() => onEdit(record)} className="text-sm px-3 py-1">
                        Edit
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(id)} className="text-sm px-3 py-1">
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return <Table columns={columns} data={vehicles} />;
};

export default VehicleList;
