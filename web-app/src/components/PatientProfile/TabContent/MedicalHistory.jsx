import React, { useState } from "react";
import { FileText, Calendar, PlusCircle, Search, Pill, Info, AlertCircle, File } from "lucide-react";
import ImageModal from "../../diagnose/ImageModal";
import PdfModal from "../TabContent/PdfModel";   

const MedicalHistory = ({ patient }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Sort medical history by diagnosed date (newest first)
  const sortedHistory = patient.medicalHistory 
    ? [...patient.medicalHistory].sort((a, b) => new Date(b.diagnosedAt) - new Date(a.diagnosedAt))
    : [];
  
  // Filter medical history based on search term and filter type
  const filteredHistory = sortedHistory.filter(item => {
    const matchesSearch = item.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.medications && item.medications.some(med => 
                           med.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "chronic") return matchesSearch && item.isChronicCondition;
    if (filterType === "acute") return matchesSearch && !item.isChronicCondition;
    return matchesSearch;
  });
  
  // Group conditions by year
  const groupedByYear = filteredHistory.reduce((acc, item) => {
    const year = new Date(item.diagnosedAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});
  
  // Sort years in descending order
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

  // Function to determine if a file is an image or PDF
  const isImageFile = (filePath) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  };

  const handleFileClick = (filePath) => {
    if (isImageFile(filePath)) {
      setSelectedImage(filePath);
    } else {
      setSelectedPdf(filePath);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-full bg-blue-100 mr-3">
          <FileText className="w-6 h-6 text-blue-900" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Medical History
        </h2>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search conditions or medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              filterType === "all"
                ? "bg-blue-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("chronic")}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "chronic"
                ? "bg-blue-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border-y border-gray-300"
            }`}
          >
            Chronic
          </button>
          <button
            onClick={() => setFilterType("acute")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              filterType === "acute"
                ? "bg-blue-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            Acute
          </button>
        </div>
      </div>
      
      {sortedHistory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-blue-900" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical History Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no medical conditions recorded for this patient. Medical history helps provide context for diagnoses and treatments.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-blue-900" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No medical conditions match your search criteria. Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-indigo-100">
          <div className="overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medications
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attachments
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedYears.map(year => (
                  <React.Fragment key={year}>
                    <tr className="bg-gradient-to-r from-blue-50 to-white">
                      <td colSpan="6" className="px-6 py-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-900" />
                          <span className="text-sm font-medium text-blue-900">{year}</span>
                        </div>
                      </td>
                    </tr>
                    
                    {groupedByYear[year].map((condition, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{condition.condition}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(condition.diagnosedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            condition.isChronicCondition 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {condition.isChronicCondition ? "Chronic" : "Acute"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {condition.medications && condition.medications.length > 0 ? (
                              condition.medications.map((med, medIdx) => (
                                <span 
                                  key={medIdx}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700"
                                >
                                  <Pill className="w-3 h-3 mr-1" />
                                  {med}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">None prescribed</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {condition.notes || "No additional notes"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {condition.filePaths && condition.filePaths.length > 0 ? (
                              condition.filePaths.map((filePath, fileIdx) => (
                                <button
                                  key={fileIdx}
                                  onClick={() => handleFileClick(filePath)}
                                  className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700"
                                >
                                  <File className="w-4 h-4 mr-1" />
                                  {isImageFile(filePath) ? "Image" : "PDF"}
                                </button>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No attachments</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        rotation={rotation}
        setRotation={setRotation}
      />

      {/* PDF Modal */}
      {selectedPdf && (
        <PdfModal
          pdfUrl={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
};

export default MedicalHistory;