import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Color Palette
const COLORS = {
  primary: "#1a5276",      // Deep blue for headers
  primaryLight: "#3498db", // Lighter blue for highlights
  accent: "#27ae60",       // Green for highlights
  text: "#2c3e50",         // Dark color for text
  textLight: "#7f8c8d",    // Light gray for secondary text
  border: "#bdc3c7",       // Border color
  white: "#ffffff",
  background: "#f8f9fa", // Light background
  headerBg: "#eaf2f8",     // Table header background
  rowAlt: "#f5f9fc",       // Alternating row color
};

// Document Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 40,        // Increased top padding
    paddingBottom: 80,     // Increased bottom padding for footer and page number
    paddingHorizontal: 40, // Increased side padding for better margins
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  wrapper: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: 15,
    borderRadius: 6,
    marginBottom: 25,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    opacity: 0.9,
  },
  reportMetadata: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    marginBottom: 25,
  },
  metadataItem: {
    flex: 1,
    padding: 10,
    borderRight: `1px solid ${COLORS.border}`,
  },
  metadataItemLast: {
    flex: 1,
    padding: 10,
  },
  metadataLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metadataValue: {
    fontSize: 10,
    fontWeight: "medium",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  table: {
    width: "100%",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    marginBottom: 20,
    backgroundColor: COLORS.white,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.rowAlt,
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: COLORS.headerBg,
  },
  tableHeaderCell: {
    padding: 8,
    fontWeight: "bold",
    borderRight: `1px solid ${COLORS.border}`,
  },
  tableHeaderCellLast: {
    padding: 8,
    fontWeight: "bold",
  },
  tableCell: {
    padding: 8,
    borderRight: `1px solid ${COLORS.border}`,
  },
  tableCellLast: {
    padding: 8,
  },
  col10: { width: "10%" },
  col15: { width: "15%" },
  col20: { width: "20%" },
  col25: { width: "25%" },
  col30: { width: "30%" },
  col40: { width: "40%" },
  col50: { width: "50%" },
  col75: { width: "75%" },
  diagnosisHeader: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.white,
    padding: 8,
    fontSize: 11,
    fontWeight: "bold",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginTop: 15,
  },
  recommendationHeader: {
    backgroundColor: COLORS.accent,
    color: COLORS.white,
    padding: 6,
    fontSize: 10,
    fontWeight: "bold",
  },
  diagnosisContainer: {
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,           // Raised footer to avoid overlap
    left: 40,
    right: 40,
    textAlign: "center",
    paddingTop: 10,
    borderTop: `1px dashed ${COLORS.border}`,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 3,
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,           // Positioned below footer
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: COLORS.textLight,
  },
  confidenceBox: {
    position: "absolute",
    top: 6,
    right: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    fontSize: 8,
  },
  highConfidence: { backgroundColor: COLORS.accent, color: COLORS.white },
  mediumConfidence: { backgroundColor: "#f39c12", color: COLORS.white },
  lowConfidence: { backgroundColor: "#e74c3c", color: COLORS.white },
});

// Utility Functions
const generateReportId = (patientData) => {
  const patientId = patientData?.patientId || "P0000";
  const timestamp = Date.now().toString().slice(-6);
  return `RPT-${patientId.slice(-4)}-${timestamp}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getConfidenceStyle = (score) => {
  if (!score) return null;
  const numScore = parseInt(score);
  if (numScore >= 80) return styles.highConfidence;
  if (numScore >= 60) return styles.mediumConfidence;
  return styles.lowConfidence;
};

// Main Component
const PatientDiagnosisReport = ({ patientData }) => {
  const reportId = generateReportId(patientData);
  const generationDate = formatDate(new Date());
  const age = patientData?.birthDate
    ? Math.floor((new Date() - new Date(patientData.birthDate)) / (1000 * 60 * 60 * 24 * 365))
    : "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Patient Diagnosis Report</Text>
            <Text style={styles.subtitle}>Comprehensive Medical Assessment</Text>
          </View>

          {/* Report Metadata */}
          <View style={styles.reportMetadata}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Report ID</Text>
              <Text style={styles.metadataValue}>{reportId}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Generated Date</Text>
              <Text style={styles.metadataValue}>{generationDate}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Patient ID</Text>
              <Text style={styles.metadataValue}>{patientData?.patientId || "N/A"}</Text>
            </View>
            <View style={styles.metadataItemLast}>
              <Text style={styles.metadataLabel}>Status</Text>
              <Text style={styles.metadataValue}>{patientData?.patientStatus || "N/A"}</Text>
            </View>
          </View>

          {/* Patient Information Table */}
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableHeaderCell, styles.col25]}><Text>Field</Text></View>
              <View style={[styles.tableHeaderCellLast, styles.col75]}><Text>Information</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col25]}><Text>Full Name</Text></View>
              <View style={[styles.tableCellLast, styles.col75]}><Text>{patientData?.fullName || "N/A"}</Text></View>
            </View>
            <View style={styles.tableRowAlt}>
              <View style={[styles.tableCell, styles.col25]}><Text>Age / Gender</Text></View>
              <View style={[styles.tableCellLast, styles.col75]}><Text>{age} / {patientData?.gender || "N/A"}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col25]}><Text>Contact Number</Text></View>
              <View style={[styles.tableCellLast, styles.col75]}><Text>{patientData?.contactNumber || "N/A"}</Text></View>
            </View>
            <View style={styles.tableRowAlt}>
              <View style={[styles.tableCell, styles.col25]}><Text>Email</Text></View>
              <View style={[styles.tableCellLast, styles.col75]}><Text>{patientData?.email || "N/A"}</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.col25]}><Text>Address</Text></View>
              <View style={[styles.tableCellLast, styles.col75]}><Text>{patientData?.address || "N/A"}</Text></View>
            </View>
            <View style={styles.tableRowLast}>
              <View style={[styles.tableCell, styles.col25]}><Text>Category</Text></View>
              <View style={[styles.tableCellLast, styles.col75]}><Text>{patientData?.category?.join(", ") || "N/A"}</Text></View>
            </View>
          </View>

          {/* Diagnosis Details Section */}
          {patientData?.diagnoseHistory && patientData.diagnoseHistory.map((diagnosis, index) => {
            const confidenceScore = diagnosis.confidenceScores?.[0]
              ? (diagnosis.confidenceScores[0] * 100).toFixed(0)
              : null;

            return (
              <View key={index} style={styles.diagnosisContainer} wrap={false}>
                <View style={styles.diagnosisHeader}>
                  <Text>Diagnosis #{index + 1}: {diagnosis.diagnosis || "Unspecified"}</Text>
                  {confidenceScore && (
                    <View style={[styles.confidenceBox, getConfidenceStyle(confidenceScore)]}>
                      <Text>{confidenceScore}%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={[styles.tableHeaderCell, styles.col20]}><Text>Date</Text></View>
                    <View style={[styles.tableHeaderCell, styles.col15]}><Text>Eye</Text></View>
                    <View style={[styles.tableHeaderCell, styles.col15]}><Text>Status</Text></View>
                    <View style={[styles.tableHeaderCellLast, styles.col50]}><Text>Follow-up</Text></View>
                  </View>
                  <View style={styles.tableRowLast}>
                    <View style={[styles.tableCell, styles.col20]}><Text>{formatDate(diagnosis.uploadedAt)}</Text></View>
                    <View style={[styles.tableCell, styles.col15]}><Text>{diagnosis.eye || "N/A"}</Text></View>
                    <View style={[styles.tableCell, styles.col15]}><Text>{diagnosis.status || "N/A"}</Text></View>
                    <View style={[styles.tableCellLast, styles.col50]}><Text>{diagnosis.revisitTimeFrame || "N/A"}</Text></View>
                  </View>
                </View>
                <View style={styles.recommendationHeader}><Text>Recommendations</Text></View>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={[styles.tableHeaderCell, styles.col20]}><Text>Type</Text></View>
                    <View style={[styles.tableHeaderCellLast, styles.col80]}><Text>Details</Text></View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.col20]}><Text>Medicine</Text></View>
                    <View style={[styles.tableCellLast, styles.col80]}><Text>{diagnosis.recommend?.medicine || "None"}</Text></View>
                  </View>
                  <View style={styles.tableRowAlt}>
                    <View style={[styles.tableCell, styles.col20]}><Text>Tests</Text></View>
                    <View style={[styles.tableCellLast, styles.col80]}><Text>
                      {diagnosis.recommend?.tests?.length > 0
                        ? diagnosis.recommend.tests.map(test => `${test.testName} (${test.status})`).join(", ")
                        : "None"}
                    </Text></View>
                  </View>
                  <View style={styles.tableRowLast}>
                    <View style={[styles.tableCell, styles.col20]}><Text>Notes</Text></View>
                    <View style={[styles.tableCellLast, styles.col80]}><Text>{diagnosis.recommend?.note || "None"}</Text></View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated: {generationDate}</Text>
          <Text style={styles.footerText}>CONFIDENTIAL MEDICAL DOCUMENT - Retinova Pvt Ltd</Text>

        </View>
      </Page>
    </Document>
  );
};

export default PatientDiagnosisReport;