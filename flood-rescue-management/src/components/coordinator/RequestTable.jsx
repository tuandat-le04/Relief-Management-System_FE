import React from 'react';
import Table from '../Common/Table';
import Button from '../Common/Button';

const RequestTable = ({ requests, onVerify, onAssign }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Location', dataIndex: 'location' },
        { title: 'Citizen', dataIndex: 'citizenName' },
        {
            title: 'Priority',
            dataIndex: 'priority',
            render: (priority) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priority === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                        priority === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                    }`}>
                    {priority || 'Not Set'}
                </span>
            )
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            render: (id, record) => (
                <div className="flex gap-2">
                    {record.status === 'PENDING' && (
                        <Button variant="success" onClick={() => onVerify(id)} className="text-sm px-3 py-1">
                            Verify
                        </Button>
                    )}
                    {record.status === 'VERIFIED' && (
                        <Button variant="primary" onClick={() => onAssign(id)} className="text-sm px-3 py-1">
                            Assign Team
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return <Table columns={columns} data={requests} />;
};

export default RequestTable;
