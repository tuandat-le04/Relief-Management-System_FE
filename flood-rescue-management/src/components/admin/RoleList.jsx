import React from 'react';
import Table from '../Common/Table';

const RoleList = ({ roles }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Description', dataIndex: 'description' },
        { title: 'Permissions', dataIndex: 'permissions', render: (perms) => perms.join(', ') },
    ];

    return <Table columns={columns} data={roles} />;
};

export default RoleList;
