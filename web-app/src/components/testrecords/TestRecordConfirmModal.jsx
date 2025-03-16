const TestRecordConfirmModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Confirm Diagnosis Test Completion</h2>
        <p className="text-red-600 mb-6">
          Are you sure you want to mark this diagnosis as Test Completed? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-sky-200 text-teal-800 px-4 py-2 rounded-md hover:bg-sky-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestRecordConfirmModal;