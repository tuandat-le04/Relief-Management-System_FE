import React from 'react';
import Table from '../Common/Table';

const RequestList = ({ requests }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Location', dataIndex: 'location' },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                        status === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-800' :
                            status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-gray-200 text-gray-800'
                    }`}>
                    {status}
                </span>
            )
        },
        { title: 'Created At', dataIndex: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    ];

    return <Table columns={columns} data={requests} />;
};

export default RequestList;
