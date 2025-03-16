import { DocumentTextIcon, EyeIcon } from "@heroicons/react/24/outline";

const TestRecordCard = ({ record, onUpdate, onComplete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-sky-200 text-sky-800 border-sky-300";
      case "In Progress":
        return "bg-cyan-200 text-cyan-800 border-cyan-300";
      case "Completed":
        return "bg-teal-200 text-teal-800 border-teal-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <h4 className="text-lg font-semibold text-black-700 mb-2">{record.diagnosis}</h4>
      <p className="text-black-600 mb-3 text-sm">{record.recommend.note || "No additional notes."}</p>
      <div className="mb-4">
        <h5 className="text-md font-medium text-blue-700 mb-2">Tests & Treatments</h5>
        {record.recommend.tests.map((test, index) => (
          <div key={index} className="flex items-center justify-between bg-sky-50 rounded-lg p-3 mb-2 border border-cyan-100">
            <div className="flex items-center space-x-3">
              <span className="text-teal-800 font-medium text-sm">{test.testName}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(test.status)}`}>
                {test.status}
              </span>
            </div>
            {test.attachmentURL && (
              <button
                onClick={() => window.open(test.attachmentURL, "_blank")}
                className="flex items-center space-x-2 px-2 py-1 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition"
              >
                <EyeIcon className="w-4 h-4" />
                <span className="text-xs">View</span>
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => onUpdate(record)}
          className="bg-sky-700 text-white px-3 py-1.5 rounded-md text-sm hover:bg-sky-900 transition"
        >
          Update Tests
        </button>
        <button
          onClick={() => onComplete(record._id)}
          className={`${record.status === "TestCompleted" ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-1.5 rounded-md text-sm transition`}
          disabled={record.status === "TestCompleted"}
        >
          Complete Diagnosis
        </button>
      </div>
    </div>
  );
};

export default TestRecordCard;