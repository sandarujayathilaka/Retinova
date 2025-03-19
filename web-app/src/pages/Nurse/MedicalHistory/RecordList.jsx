import React, { memo } from "react";
import RecordItem from "./RecordItem";

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


RecordList.displayName = "RecordList";

export default RecordList;