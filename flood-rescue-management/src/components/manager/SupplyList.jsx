import React from 'react';
import Table from '../Common/Table';
import Button from '../Common/Button';

const SupplyList = ({ supplies, onUpdate }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Category', dataIndex: 'category' },
        { title: 'Current Stock', dataIndex: 'currentStock' },
        { title: 'Min Stock', dataIndex: 'minStock' },
        {
            title: 'Status',
            dataIndex: 'currentStock',
            render: (stock, record) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stock <= record.minStock ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                    }`}>
                    {stock <= record.minStock ? 'Low Stock' : 'In Stock'}
                </span>
            ),
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            render: (id, record) => (
                <Button variant="primary" onClick={() => onUpdate(record)} className="text-sm px-3 py-1">
                    Update
                </Button>
            ),
        },
    ];

    return <Table columns={columns} data={supplies} />;
};

export default SupplyList;
