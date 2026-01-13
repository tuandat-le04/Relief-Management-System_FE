import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';

const AssignTeam = ({ isOpen, onClose, teams, onAssign }) => {
    const [selectedTeam, setSelectedTeam] = useState('');

    const handleAssign = () => {
        if (selectedTeam) {
            onAssign(selectedTeam);
            setSelectedTeam('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Rescue Team">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Team
                    </label>
                    <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select a team --</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name} ({team.availableMembers} members available)
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAssign} disabled={!selectedTeam}>
                        Assign
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignTeam;
