import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Refined color palette for a professional medical design
const COLORS = {
  primary: "#1a56db",       // Deeper blue - more professional
  primaryLight: "#e0eaff",  // Subtle light blue background
  secondary: "#0f766e",     // Teal - complementary medical color
  secondaryLight: "#ccfbf1", // Light teal background
  text: "#1e293b",          // Dark slate - primary text
  textLight: "#64748b",     // Light slate - secondary text
  success: "#059669",       // Green - positive indicators
  warning: "#d97706",       // Amber - caution indicators
  border: "#cbd5e1",        // Light gray borders
  white: "#ffffff",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
};

// Optimized styles with better space utilization
const styles = StyleSheet.create({
  // Layout styles
  page: { 
    padding: 0, 
    fontSize: 9, 
    fontFamily: "Helvetica",
    color: COLORS.text
  },
  content: {
    padding: 20,
  },
  section: { 
    marginBottom: 10,
    borderRadius: 3,
    border: `1px solid ${COLORS.border}`,
    padding: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden"
  },
  
  // Typography styles
  title: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 2
  },
  subtitle: { 
    fontSize: 12, 
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: `1px solid ${COLORS.primaryLight}` 
  },
  sectionTitle: {
    backgroundColor: COLORS.primaryLight,
    padding: 4,
    marginBottom: 6,
    marginHorizontal: -8,
    marginTop: -8,
    fontWeight: "bold",
    fontSize: 10,
    color: COLORS.primary
  },
  text: { 
    marginBottom: 3,
    fontSize: 9
  },
  label: {
    color: COLORS.textLight,
    marginRight: 3,
    fontSize: 8
  },
  value: {
    fontWeight: "bold",
    fontSize: 8
  },
  
  // Component-specific styles
  header: { 
    backgroundColor: COLORS.primary, 
    color: COLORS.white, 
    padding: 15,
    paddingTop: 20,
    marginBottom: 15
  },
  headerSubtitle: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 8
  },
  footer: { 
    marginTop: 10, 
    textAlign: "center", 
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 7,
    color: COLORS.textLight,
    borderTop: `1px solid ${COLORS.border}`
  },
  watermark: {
    position: "absolute",
    top: 300,
    left: 100,
    fontSize: 70,
    color: COLORS.primaryLight,
    transform: "rotate(-45deg)",
    opacity: 0.15
  },
  
  // Information display styles
  infoRow: {
    flexDirection: "row",
    marginBottom: 3
  },
  infoColumn: {
    width: "50%"
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 3
  },
  highlightBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 3,
    padding: 5,
    marginTop: 6
  },
  
  // Table styles
  table: { 
    display: "table", 
    width: "100%", 
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
    borderStyle: "solid", 
    borderColor: COLORS.border,
    borderWidth: 1
  },
  tableRow: { 
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomStyle: "solid",
    minHeight: 18,
    alignItems: "center"
  },
  tableRowEven: {
    backgroundColor: COLORS.white
  },
  tableRowOdd: {
    backgroundColor: COLORS.gray100
  },
  tableLastRow: {
    borderBottomWidth: 0
  },
  tableColHeader: { 
    width: "20%", 
    backgroundColor: COLORS.primary, 
    padding: 4,
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center"
  },
  tableCol: { 
    width: "20%", 
    padding: 4,
    fontSize: 8,
    textAlign: "center"
  },
  
  // Image styles
  image: { 
    width: 100, 
    height: 100, 
    marginRight: 10,
    borderRadius: 3,
    border: `1px solid ${COLORS.border}`
  },
  thumbnailImage: {
    width: 60, 
    height: 60, 
    margin: 3,
    borderRadius: 3,
    border: `1px solid ${COLORS.border}`
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    justifyContent: "center"
  },
  
  // Clinical data styles
  clinicalRecord: {
    marginBottom: 6,
    padding: 6,
    backgroundColor: COLORS.gray100,
    borderLeft: `3px solid ${COLORS.secondary}`,
    borderRadius: 3
  },
  recommendation: {
    marginBottom: 5,
    paddingLeft: 10,
    position: "relative",
    fontSize: 8
  },
  bullet: {
    position: "absolute",
    left: 0,
    color: COLORS.primary,
    fontWeight: "bold"
  },
  
  // Status indicators
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    fontSize: 7,
    textAlign: "center",
    maxWidth: 60
  },
  statusActive: {
    backgroundColor: COLORS.success,
    color: COLORS.white
  },
  statusInactive: {
    backgroundColor: COLORS.textLight,
    color: COLORS.white
  },
  
  confidenceBar: {
    height: 10,
    backgroundColor: COLORS.gray200,
    borderRadius: 5,
    width: "100%",
    maxWidth: 80,
    position: "relative",
    overflow: "hidden"
  },
  confidenceFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: COLORS.success
  },
  confidenceText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    textAlign: "center",
    fontSize: 7,
    color: COLORS.white,
    fontWeight: "bold"
  },
  patientIdBadge: {
    backgroundColor: COLORS.primaryLight,
    padding: 4,
    borderRadius: 3,
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 6
  },
  patientIdText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "bold"
  },
  
  // Two-column layout
  twoColumnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  columnLeft: {
    width: "48%"
  },
  columnRight: {
    width: "48%"
  }
});

// Component for patient basic information (optimized for space)
const PatientInfoSection = ({ patientData }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Patient Profile</Text>
    
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={styles.patientIdBadge}>
        <Text style={styles.patientIdText}>
          ID: {patientData?.patientId || "P12345678"}
        </Text>
      </View>
      
      {/* Add compact status indicator */}
      <View style={[styles.statusBadge, styles.statusActive, { alignSelf: "flex-end" }]}>
        <Text>Active Patient</Text>
      </View>
    </View>
    
    <View style={{ flexDirection: 'row' }}>
      <View style={styles.infoColumn}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{patientData?.fullName || "John Doe"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Age/Gender:</Text>
          <Text style={styles.value}>{patientData?.age || "45"} y/o {patientData?.gender || "Male"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{patientData?.phoneNumber || "+1 234 567 8900"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{patientData?.email || "john.doe@example.com"}</Text>
        </View>
      </View>
      <View style={styles.infoColumn}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Blood:</Text>
          <Text style={styles.value}>{patientData?.bloodGroup || "AB+"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Height/Weight:</Text>
          <Text style={styles.value}>{patientData?.height || "175"} cm / {patientData?.weight || "78"} kg</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>BMI:</Text>
          <Text style={styles.value}>{patientData?.bmi || "25.5"}</Text>
        </View>
        
      </View>
    </View>
  </View>
);

// Component for prediction section (more compact)
const PredictionSection = ({ prediction, imageUrl }) => (
  prediction && (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Latest Assessment</Text>
      <View style={{ flexDirection: 'row' }}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Diagnosis:</Text>
              <Text style={[styles.value, { color: COLORS.secondary, fontSize: 10 }]}>
                {prediction.type || "N/A"}
              </Text>
            </View>
            
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "50%" }}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>
                    {new Date().toLocaleDateString() || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {prediction.notes && (
            <View style={[styles.highlightBox, { backgroundColor: COLORS.secondaryLight, marginTop: 4 }]}>
              <Text style={[styles.label, { marginBottom: 2 }]}>Clinical Notes:</Text>
              <Text style={{ fontSize: 8, fontStyle: 'italic' }}>{prediction.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
);

// Component for diagnosis history table (more compact)
const DiagnosisHistorySection = ({ patientData }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Diagnosis History</Text>
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableColHeader, { width: "25%" }]}>Date</Text>
        <Text style={[styles.tableColHeader, { width: "30%" }]}>Diagnosis</Text>
        <Text style={[styles.tableColHeader, { width: "15%" }]}>Eye</Text>
        <Text style={[styles.tableColHeader, { width: "15%" }]}>Confidence</Text>
        <Text style={[styles.tableColHeader, { width: "15%" }]}>Doctor</Text>
      </View>
      {(patientData?.diagnoseHistory?.slice(0, 4) || []).map((diagnosis, index) => (
        <View 
          style={[
            styles.tableRow, 
            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            index === (patientData?.diagnoseHistory?.slice(0, 4) || []).length - 1 ? styles.tableLastRow : {}
          ]} 
          key={index}
        >
          <Text style={[styles.tableCol, { width: "25%" }]}>
            {new Date(diagnosis.uploadedAt).toLocaleDateString()}
          </Text>
          <Text style={[styles.tableCol, { width: "30%" }]}>
            {diagnosis.diagnosis || "N/A"}
          </Text>
          <Text style={[styles.tableCol, { width: "15%" }]}>
            {diagnosis.eye || "N/A"}
          </Text>
          <Text style={[styles.tableCol, { width: "15%" }]}>
            {Math.max(...(diagnosis.confidenceScores || [0])).toFixed(1)}%
          </Text>
          <Text style={[styles.tableCol, { width: "15%" }]}>
            Dr. {diagnosis.doctor || "N/A"}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

// Component for treatment section (more compact)
const TreatmentSection = ({ patientData }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Treatment & Medications</Text>
    {(patientData?.medicalHistory?.slice(0, 2) || []).map((record, index) => (
      <View key={index} style={styles.clinicalRecord}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
          <Text style={{ fontWeight: "bold", color: COLORS.secondary, fontSize: 9 }}>{record.condition}</Text>
          <View style={[
            styles.statusBadge, 
            record.status === "Active" ? styles.statusActive : styles.statusInactive
          ]}>
            <Text>{record.status || "Active"}</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ width: "30%" }}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Diagnosed:</Text>
              <Text style={styles.value}>{new Date(record.diagnosedAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={{ width: "30%" }}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Follow-up:</Text>
              <Text style={styles.value}>{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : "As needed"}</Text>
            </View>
          </View>
          <View style={{ width: "40%" }}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Medications:</Text>
              <Text style={styles.value}>{record.medications?.join(", ") || "None"}</Text>
            </View>
          </View>
        </View>
        
        {record.notes && <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 2 }}>{record.notes}</Text>}
      </View>
    ))}
  </View>
);

// Component for recommendations section (more compact)
const RecommendationsSection = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Care Recommendations</Text>
    
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      <View style={{ width: "50%" }}>
        <View style={styles.recommendation}>
          <Text style={styles.bullet}>•</Text>
          <Text><Text style={{ fontWeight: "bold", color: COLORS.secondary }}>Regular Eye Exams:</Text> Every 3-6 months</Text>
        </View>
      
        <View style={styles.recommendation}>
          <Text style={styles.bullet}>•</Text>
          <Text><Text style={{ fontWeight: "bold", color: COLORS.secondary }}>Blood Sugar:</Text> HbA1c below 7.0%</Text>
        </View>
      </View>
      
      <View style={{ width: "50%" }}>
        <View style={styles.recommendation}>
          <Text style={styles.bullet}>•</Text>
          <Text><Text style={{ fontWeight: "bold", color: COLORS.secondary }}>Blood Pressure:</Text> Keep below 130/80 mmHg</Text>
        </View>
      
        <View style={styles.recommendation}>
          <Text style={styles.bullet}>•</Text>
          <Text><Text style={{ fontWeight: "bold", color: COLORS.secondary }}>Lifestyle:</Text> Exercise, balanced diet, no smoking</Text>
        </View>
      </View>
    </View>
    
    <View style={[styles.highlightBox, { backgroundColor: COLORS.secondaryLight, marginTop: 5 }]}>
      <Text style={{ fontWeight: "bold", color: COLORS.secondary, fontSize: 9, marginBottom: 3 }}>
        Next Steps
      </Text>
      <Text style={{ fontSize: 8 }}>
        Schedule follow-up appointment within 3 months. Contact ophthalmologist immediately for any sudden vision changes.
      </Text>
    </View>
  </View>
);

// Helper function to generate a unique report ID
const generateReportId = (patientData) => {
  const patientId = patientData?.patientId || "P12345678";
  const timestamp = Date.now().toString().slice(-6);
  return `RPT-${patientId.slice(-4)}-${timestamp}`;
};

// Main component with optimized layout
const PatientReportPDF = ({ patientData, prediction, imageUrl }) => {
  const reportId = generateReportId(patientData);
  const generationDate = new Date().toLocaleString();
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>CONFIDENTIAL</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Patient Health Report</Text>
          <Text style={styles.headerSubtitle}>
            Generated on {new Date().toLocaleDateString()} • Report ID: {reportId}
          </Text>
        </View>
        
        {/* Content Container */}
        <View style={styles.content}>
          {/* Patient Info Section */}
          <PatientInfoSection patientData={patientData} />
          
          {/* Two-column layout for middle sections */}
          <View style={styles.twoColumnContainer}>
            <View style={styles.columnLeft}>
              <PredictionSection prediction={prediction} imageUrl={imageUrl} />
            </View>
            <View style={styles.columnRight}>
              <RecommendationsSection />
            </View>
          </View>
          
          {/* Treatment Section */}
          <TreatmentSection patientData={patientData} />
          
          {/* History Section */}
          <DiagnosisHistorySection patientData={patientData} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginBottom: 3, color: COLORS.primary }}>
              Eye Diagnosis System
            </Text>
            <Text style={{ marginBottom: 5 }}>Consult your healthcare provider for medical advice</Text>
            <Text>Report ID: {reportId} • Generated: {generationDate} • CONFIDENTIAL MEDICAL RECORD</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PatientReportPDF;