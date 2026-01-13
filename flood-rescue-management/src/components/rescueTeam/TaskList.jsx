import React from 'react';
import Table from '../Common/Table';
import Button from '../Common/Button';

const TaskList = ({ tasks, onViewDetail }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Location', dataIndex: 'location' },
        {
            title: 'Priority',
            dataIndex: 'priority',
            render: (priority) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priority === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                        priority === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                            priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'
                    }`}>
                    {priority}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                    {status}
                </span>
            )
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            render: (id, record) => (
                <Button variant="outline" onClick={() => onViewDetail(record)} className="text-sm px-3 py-1">
                    View
                </Button>
            ),
        },
    ];

    return <Table columns={columns} data={tasks} />;
};

export default TaskList;
