import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TreatmentRecords = () => {
    const { patientId } = useParams();  // Get patientId from the URL

    const [diagnoseHistory, setDiagnoseHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null); // Track selected diagnosis for side box

    useEffect(() => {
        const fetchDiagnoseHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/treatments/${patientId}/diagnoses-with-treatments`);
                console.log(response.data); // Log data for debugging
                setDiagnoseHistory(response.data);
            } catch (err) {
                setError("Failed to fetch diagnose history");
                console.error(err); // Log the error for debugging
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchDiagnoseHistory();
        }
    }, [patientId]);  // Re-fetch data when patientId changes

    // Open side box for a specific diagnosis
    const openSideBox = (diagnose) => {
        setSelectedDiagnosis(diagnose);
    };

    // Close side box
    const closeSideBox = () => {
        setSelectedDiagnosis(null);
    };

    if (loading) return <p className="text-center text-gray-600">Loading...</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    // Helper function to format date or return fallback
    const formatDate = (dateString) => {
        if (!dateString) return "Date not available"; // Fallback if dateString is missing
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString(); // Check if date is valid
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Treatment Records for Patient {patientId}</h2>

            {/* Main Grid and Side Box Container */}
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)]">
                {/* Main Grid (2x2 when side box is open) */}
                <div className={`w-full ${selectedDiagnosis ? "md:w-2/3" : "w-full"} overflow-y-auto`}>
                    <div className={`grid ${selectedDiagnosis ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6 transition-all duration-300`}>
                        {diagnoseHistory.map((diagnose) => (
                            <div key={diagnose._id} className="bg-white shadow-xl rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="p-6">
                                    {/* Diagnosis Section */}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            Diagnosis: {diagnose.diagnosis?.diagnosis || "No diagnosis available"}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Last Updated: {formatDate(diagnose.diagnosis?.uploadedAt)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Status: <span className={`font-medium ${diagnose.diagnosis?.status === "Unchecked" ? "text-yellow-600" : "text-green-600"}`}>
                                                {diagnose.diagnosis?.status || "No status available"}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Doctor Prescribes Section */}
                                    {diagnose.diagnosis?.recommend && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Doctor Prescribes:</h4>
                                            <div className="bg-gray-100 p-4 rounded-lg">
                                                <h5 className="text-sm font-semibold text-gray-600">Medicines:</h5>
                                                {diagnose.diagnosis.recommend.medicine && diagnose.diagnosis.recommend.medicine.length > 0 ? (
                                                    <ul className="list-disc list-inside mt-2">
                                                        {diagnose.diagnosis.recommend.medicine.map((med, index) => (
                                                            <li key={index} className="text-sm text-gray-700">{med}</li>
                                                        ))}
                                                    </ul>
                                                ) : (<p className="text-sm text-gray-500">No medicines prescribed.</p>)}

                                                <h5 className="text-sm font-semibold text-gray-600 mt-3">Tests:</h5>
                                                {diagnose.diagnosis.recommend.tests && diagnose.diagnosis.recommend.tests.length > 0 ? (
                                                    <ul className="list-disc list-inside mt-2">
                                                        {diagnose.diagnosis.recommend.tests.map((test, index) => (
                                                            <li key={index} className="text-sm text-gray-700">{test}</li>
                                                        ))}
                                                    </ul>
                                                ) : (<p className="text-sm text-gray-500">No tests recommended.</p>)}

                                                {diagnose.diagnosis.recommend.note && (
                                                    <p className="text-sm font-medium text-gray-700 mt-3">Notes: {diagnose.diagnosis.recommend.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show Treatments Button */}
                                    {diagnose.treatments && diagnose.treatments.length > 0 && (
                                        <button
                                            onClick={() => openSideBox(diagnose)}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                                        >
                                            Show Treatments
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Box (1/3 width when open) */}
                {selectedDiagnosis && (
                    <div className="w-full md:w-1/3 bg-white shadow-xl rounded-lg p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Treatments for Diagnosis: {selectedDiagnosis.diagnosis?.diagnosis}</h3>
                            <button
                                onClick={closeSideBox}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Treatments & Tests Section */}
                        {selectedDiagnosis.treatments.map((treatment) => (
                            <div key={treatment._id} className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-gray-700">Treatment Plan: {treatment.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Created At: {formatDate(treatment.createdAt)}</p>

                                {/* Treatments Subcard */}
                                {treatment.treatments && treatment.treatments.length > 0 && (
                                    <div className="mt-3 p-3 bg-white rounded-lg">
                                        <h5 className="text-sm font-semibold text-gray-600">Treatments:</h5>
                                        <ul className="list-disc list-inside mt-2">
                                            {treatment.treatments.map((treat, index) => (
                                                <li key={index} className="text-sm text-gray-700">
                                                    {treat.name} - <span className={`font-medium ${treat.status === "pending" ? "text-yellow-600" : "text-green-600"}`}>
                                                        {treat.status}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Tests Subcard */}
                                {treatment.tests && treatment.tests.length > 0 && (
                                    <div className="mt-3 p-3 bg-white rounded-lg">
                                        <h5 className="text-sm font-semibold text-gray-600">Tests:</h5>
                                        <ul className="list-disc list-inside mt-2">
                                            {treatment.tests.map((test, index) => (
                                                <li key={index} className="text-sm text-gray-700">
                                                    {test.name} - Result: <span className="font-medium">{test.value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreatmentRecords;