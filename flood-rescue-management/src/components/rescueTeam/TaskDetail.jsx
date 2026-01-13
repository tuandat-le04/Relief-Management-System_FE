import React from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';

const TaskDetail = ({ task, onUpdateStatus }) => {
    return (
        <Card>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Task #{task.id}</h3>
                    <p className="text-gray-600">{task.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-medium">Location:</span>
                        <p>{task.location}</p>
                    </div>
                    <div>
                        <span className="font-medium">Number of People:</span>
                        <p>{task.numberOfPeople}</p>
                    </div>
                    <div>
                        <span className="font-medium">Priority:</span>
                        <p className="font-semibold text-red-600">{task.priority}</p>
                    </div>
                    <div>
                        <span className="font-medium">Status:</span>
                        <p className="font-semibold text-blue-600">{task.status}</p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button variant="primary" onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}>
                        Start Task
                    </Button>
                    <Button variant="success" onClick={() => onUpdateStatus(task.id, 'COMPLETED')} className="ml-2">
                        Complete Task
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default TaskDetail;
