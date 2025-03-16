
// import RecordItem from "./RecordItem";

// const RecordList = ({
//   records,
//   editingRecord,
//   setEditingRecord,
//   onEdit,
//   onDelete,
//   setShowDeleteModal,
//   setEnlargedImage,
//   patientId,
//   fetchRecords,
//   saveLoading,
// }) => {
//   return (
//     <div className="space-y-6">
//       {records.length > 0 ? (
//         records.map((record) =>
//           record && record._id ? (
//             <RecordItem
//               key={record._id}
//               record={record}
//               editingRecord={editingRecord}
//               setEditingRecord={setEditingRecord}
//               onEdit={onEdit}
//               onDelete={onDelete}
//               setShowDeleteModal={setShowDeleteModal}
//               setEnlargedImage={setEnlargedImage}
//               patientId={patientId}
//               fetchRecords={fetchRecords}
//               saveLoading={saveLoading}
//             />
//           ) : null
//         )
//       ) : null}
//     </div>
//   );
// };

// export default RecordList;

import React, { memo } from "react";
import RecordItem from "./RecordItem";

/**
 * Displays a list of medical records
 * Memoized to prevent unnecessary re-renders
 */
const RecordList = memo(({
  records,
  editingRecord,
  setEditingRecord,
  onEdit,
  onDelete,
  setShowDeleteModal,
  setEnlargedImage,
  patientId,
  fetchRecords,
  saveLoading,
}) => {
  // Early return if no records
  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {records.map((record) => (
        record && record._id ? (
          <RecordItem
            key={record._id}
            record={record}
            editingRecord={editingRecord}
            setEditingRecord={setEditingRecord}
            onEdit={onEdit}
            onDelete={onDelete}
            setShowDeleteModal={setShowDeleteModal}
            setEnlargedImage={setEnlargedImage}
            patientId={patientId}
            fetchRecords={fetchRecords}
            saveLoading={saveLoading}
          />
        ) : null
      ))}
    </div>
  );
});

// Set displayName for debugging
RecordList.displayName = "RecordList";

export default RecordList;