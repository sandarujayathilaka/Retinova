import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddTreatment from "./AddTreatment";

const TreatmentRecords = () => {
    const { patientId } = useParams();
    const [diagnoseHistory, setDiagnoseHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [showAddTreatmentForm, setShowAddTreatmentForm] = useState(false);

    // Fetch diagnosis history
    const fetchDiagnoseHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/treatments/${patientId}/diagnoses-with-treatments`);
            setDiagnoseHistory(response.data);
        } catch (err) {
            setError("Failed to fetch diagnose history");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchDiagnoseHistory();
        }
    }, [patientId]);

    // Open side box for a specific diagnosis
    const openSideBox = (diagnose) => {
        setSelectedDiagnosis(diagnose);
    };

    // Close side box
    const closeSideBox = () => {
        setSelectedDiagnosis(null);
        setShowAddTreatmentForm(false);
    };

    // Open the add treatment form
    const openAddTreatmentForm = () => {
        setShowAddTreatmentForm(true);
    };

    // Handle new treatment submission
    const handleNewTreatmentAdded = async () => {
        try {
            // Refetch the diagnosis history
            const response = await axios.get(`http://localhost:4000/api/treatments/${patientId}/diagnoses-with-treatments`);
            setDiagnoseHistory(response.data);

            // Find the updated diagnosis in the new data
            const updatedDiagnosis = response.data.find(
                (diagnose) => diagnose.diagnosis._id === selectedDiagnosis.diagnosis._id
            );

            // Update the selectedDiagnosis state with the new data
            if (updatedDiagnosis) {
                setSelectedDiagnosis(updatedDiagnosis);
            }

            setShowAddTreatmentForm(false); // Close the form
        } catch (error) {
            console.error("Error refetching data:", error);
        }
    };

    if (loading) return <p className="text-center text-gray-600">Loading...</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString();
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-800">
                Treatment Records for Patient {patientId}
            </h2>

            {/* Main Grid and Side Box Container */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
                {/* Main Grid */}
                <div className={`w-full ${selectedDiagnosis ? "md:w-2/3" : "w-full"} overflow-y-auto`}>
                    <div className={`grid ${selectedDiagnosis ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-4 md:gap-6 transition-all duration-300`}>
                        {diagnoseHistory.map((diagnose) => (
                            <div key={diagnose._id} className="bg-white shadow-xl rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="p-4 md:p-6">
                                    {/* Diagnosis Section */}
                                    <div className="mb-4 md:mb-6">
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                                            Diagnosis: {diagnose.diagnosis?.diagnosis || "No diagnosis available"}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                                            Last Updated: {formatDate(diagnose.diagnosis?.uploadedAt)}
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-500 mt-1">
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

                {/* Side Box */}
                {selectedDiagnosis && (
                    <div className="w-full md:w-1/2 bg-teal-50 shadow-xl rounded-lg p-4 md:p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h3 className="text-lg md:text-xl font-semibold text-black">
                                Treatment Records | {selectedDiagnosis.diagnosis?.diagnosis}
                            </h3>
                            <div>
                                <button
                                    onClick={openAddTreatmentForm}
                                    className="bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors duration-300 mr-2"
                                >
                                    Add Record
                                </button>
                                <button
                                    onClick={closeSideBox}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Add Treatment Form */}
                        {showAddTreatmentForm && (
                            <AddTreatment
                                patientId={patientId}
                                diagnosisId={selectedDiagnosis.diagnosis._id}
                                optometristId="65e8319b8b93e45a1d4fba69" // Default logged-in user ID
                                onClose={() => setShowAddTreatmentForm(false)}
                                onNewTreatmentAdded={handleNewTreatmentAdded} // Pass the callback function
                            />
                        )}

                        {/* Treatments & Tests Section */}
                        {selectedDiagnosis.treatments.map((treatment) => (
                            <div key={treatment._id} className="bg-cyan-100 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-gray-700">Treatment Plan: {treatment.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Created At: {formatDate(treatment.createdAt)}</p>

                                {/* Treatments Subcard */}
                                {treatment.treatments && treatment.treatments.length > 0 && (
                                    <div className="mt-3 p-3 bg-sky-50 rounded-lg">
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
                                    <div className="mt-3 p-3 bg-sky-50 rounded-lg">
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