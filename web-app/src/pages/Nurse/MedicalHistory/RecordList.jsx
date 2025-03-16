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
// }) => {
//   return (
//     <div className="space-y-4">
//       {records.length > 0 ? (
//         records.map((record) =>
//           record && record._id ? (
//             <RecordItem
//               key={record._id}
//               record={record}
//               editingRecord={editingRecord}
//               setEditingRecord={setEditingRecord}
//               onEdit={onEdit}
//               onDelete={() => {
//                 onDelete(record._id);
//                 setShowDeleteModal(true);
//               }}
//               setEnlargedImage={setEnlargedImage}
//               patientId={patientId}
//               fetchRecords={fetchRecords}
//             />
//           ) : null
//         )
//       ) : (
//         <div className="text-center py-10 bg-white rounded-lg shadow-md border border-teal-100">
//           <p className="text-gray-600 text-lg">No medical records available yet.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecordList;
import RecordItem from "./RecordItem";

const RecordList = ({
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
  return (
    <div className="space-y-6">
      {records.length > 0 ? (
        records.map((record) =>
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
        )
      ) : null}
    </div>
  );
};

export default RecordList;