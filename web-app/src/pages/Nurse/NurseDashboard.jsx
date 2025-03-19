import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusIcon, PencilIcon, ClockIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]); // Mock patient data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '' });

  // Mock data for demo (replace with API calls)
  const todaySchedule = { start: '09:00', end: '17:00' };
  const pendingTasks = [
    { id: 1, patient: 'John Doe', task: 'Update Test Results' },
    { id: 2, patient: 'Jane Smith', task: 'Schedule Revisit' },
  ];

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/patients', newPatient);
      setPatients([...patients, res.data]);
      setNewPatient({ name: '', phone: '', email: '' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error registering patient:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6">Nurse Dashboard</h1>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-primary flex items-center">
            <ClockIcon className="w-5 h-5 mr-2" /> Today’s Schedule
          </h2>
          <p className="mt-2 text-gray-700">
            {todaySchedule.start} - {todaySchedule.end}
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-primary">Pending Tasks</h2>
          <ul className="mt-2 space-y-2">
            {pendingTasks.map((task) => (
              <li key={task.id} className="text-gray-700 flex justify-between">
                <span>{task.patient} - {task.task}</span>
                <button className="text-secondary hover:text-accent">
                  <PencilIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Register Patient */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 flex items-center bg-secondary text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" /> Register Patient
          </button>
        </div>
      </div>

      {/* Patient Overview */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-primary mb-4">Patient Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Next Visit</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-3">{patient.name}</td>
                  <td className="p-3">{patient.status || 'Stable'}</td>
                  <td className="p-3">{patient.nextVisit || 'N/A'}</td>
                  <td className="p-3 flex space-x-2">
                    <button className="text-secondary hover:text-accent">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Patient Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold text-primary">
              Register New Patient
            </Dialog.Title>
            <form onSubmit={handleRegisterPatient} className="mt-4 space-y-4">
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white rounded hover:bg-green-700"
                >
                  Register
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default NurseDashboard;