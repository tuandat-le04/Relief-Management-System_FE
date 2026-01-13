import React from 'react';
import Table from '../Common/Table';
import Button from '../Common/Button';

const UserList = ({ users, onEdit, onDelete }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', dataIndex: 'role' },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'ACTIVE' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                    }`}>
                    {status}
                </span>
            ),
        },
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

    return <Table columns={columns} data={users} />;
};

export default UserList;
