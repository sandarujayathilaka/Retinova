import { useState } from "react";
import axios from "axios";

const AddTreatment = ({ patientId, diagnosisId, optometristId, onClose, onNewTreatmentAdded }) => {
    const [formData, setFormData] = useState({
        treatments: [{ name: "", status: "pending" }],
        tests: [{ name: "", value: "", attachment: "" }],
        description: ""
    });

    const handleChange = (e, index, type) => {
        const { name, value } = e.target;
        const newData = [...formData[type]];
        newData[index][name] = value;
        setFormData({ ...formData, [type]: newData });
    };

    const addTreatment = () => {
        setFormData({
            ...formData,
            treatments: [...formData.treatments, { name: "", status: "pending" }]
        });
    };

    const addTest = () => {
        setFormData({
            ...formData,
            tests: [...formData.tests, { name: "", value: "", attachment: "" }]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:4000/api/treatments", {
                patientId,
                diagnosisId,
                optometristId,
                ...formData
            });
            console.log(response.data);
            onNewTreatmentAdded(); // Notify parent component to update the UI
        } catch (error) {
            console.error("Error adding treatment:", error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">Add New Treatment Record</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Treatments</label>
                    {formData.treatments.map((treatment, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                name="name"
                                value={treatment.name}
                                onChange={(e) => handleChange(e, index, "treatments")}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Treatment Name"
                                required
                            />
                            <select
                                name="status"
                                value={treatment.status}
                                onChange={(e) => handleChange(e, index, "treatments")}
                                className="p-2 border rounded-lg"
                                required
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    ))}
                    <button type="button" onClick={addTreatment} className="text-sm text-blue-600 hover:text-blue-800">
                        + Add Treatment
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tests</label>
                    {formData.tests.map((test, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                name="name"
                                value={test.name}
                                onChange={(e) => handleChange(e, index, "tests")}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Test Name"
                                required
                            />
                            <input
                                type="text"
                                name="value"
                                value={test.value}
                                onChange={(e) => handleChange(e, index, "tests")}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Test Result"
                                required
                            />
                            <input
                                type="text"
                                name="attachment"
                                value={test.attachment}
                                onChange={(e) => handleChange(e, index, "tests")}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Attachment URL"
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addTest} className="text-sm text-blue-600 hover:text-blue-800">
                        + Add Test
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        placeholder="Description"
                        required
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                    <button type="submit" className="bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-teal-500">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTreatment;