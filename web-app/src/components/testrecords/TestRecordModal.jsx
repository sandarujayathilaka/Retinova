import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const TestRecordModal = ({ show, onClose, diagnose, onSave, handleFileUpload }) => {
  const [localDiagnose, setLocalDiagnose] = useState(null);

  useEffect(() => {
    setLocalDiagnose(diagnose);
  }, [diagnose]);

  const handleStatusChange = (index, value) => {
    if (!localDiagnose) return;
    const newTests = [...localDiagnose.recommend.tests];
    newTests[index].status = value;
    setLocalDiagnose({ ...localDiagnose, recommend: { ...localDiagnose.recommend, tests: newTests } });
  };

  if (!show || !localDiagnose) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl transform transition-all duration-300">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Update Tests for {localDiagnose.diagnosis}</h2>
        {localDiagnose.recommend.tests.map((test, index) => (
          <div key={index} className="mb-5">
            <label className="block text-cyan-700 font-medium mb-2">{test.testName}</label>
            <select
              value={test.status}
              onChange={(e) => handleStatusChange(index, e.target.value)}
              className="w-full p-2 border border-sky-300 rounded-md focus:ring-2 focus:ring-cyan-500 bg-sky-50"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="file"
              onChange={async (e) => {
                const url = await handleFileUpload(e.target.files[0], localDiagnose._id, index);
                const newTests = [...localDiagnose.recommend.tests];
                newTests[index].attachmentURL = url;
                setLocalDiagnose({ ...localDiagnose, recommend: { ...localDiagnose.recommend, tests: newTests } });
              }}
              className="mt-2 block w-full text-sm text-teal-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200"
            />
            {test.attachmentURL && (
              <div className="mt-2 flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-sky-500" />
                <a href={test.attachmentURL} target="_blank" rel="noopener noreferrer" className="text-cyan-600 text-sm hover:underline">
                  Current Attachment
                </a>
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="bg-sky-200 text-teal-800 px-4 py-2 rounded-md hover:bg-sky-300">
            Cancel
          </button>
          <button onClick={() => onSave(localDiagnose._id, localDiagnose.recommend.tests)} className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestRecordModal;