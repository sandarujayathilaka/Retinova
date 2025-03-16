import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Color palette
const COLORS = {
  primary: "#1a56db",
  primaryLight: "#e0eaff",
  text: "#1e293b",
  textLight: "#64748b",
  border: "#cbd5e1",
  white: "#ffffff",
  gray100: "#f1f5f9",
};

// Styles
const styles = StyleSheet.create({
  page: { 
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.text,
  },
  header: { 
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  title: { 
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 8,
    opacity: 0.9,
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    borderBottom: `1px solid ${COLORS.primaryLight}`,
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 120,
    color: COLORS.textLight,
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontWeight: "normal",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: COLORS.textLight,
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 10,
  },
});

// Helper function to generate report ID
const generateReportId = (patientData) => {
  const patientId = patientData?.patientId || "P0000";
  const timestamp = Date.now().toString().slice(-6);
  return `RPT-${patientId.slice(-4)}-${timestamp}`;
};

// Main PDF Component
const FullPatientPDFReport = ({ patientData }) => {
  const reportId = generateReportId(patientData);
  const generationDate = new Date().toLocaleString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Patient Comprehensive Report</Text>
          <Text style={styles.subtitle}>
            Report ID: {reportId} • Generated: {generationDate}
          </Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Patient ID:</Text>
            <Text style={styles.value}>{patientData?.patientId || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{patientData?.fullName || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age/Gender:</Text>
            <Text style={styles.value}>
              {patientData?.age || "N/A"} / {patientData?.gender || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{patientData?.email || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact Number:</Text>
            <Text style={styles.value}>{patientData?.contactNumber || "N/A"}</Text>
          </View>
        </View>

        {/* Vital Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vital Statistics</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Blood Group:</Text>
            <Text style={styles.value}>{patientData?.bloodGroup || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Height:</Text>
            <Text style={styles.value}>{patientData?.height || "N/A"} cm</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>{patientData?.weight || "N/A"} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>BMI:</Text>
            <Text style={styles.value}>{patientData?.bmi || "N/A"}</Text>
          </View>
        </View>

        {/* Medical History */}
        {patientData?.medicalHistory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical History</Text>
            {patientData.medicalHistory.map((record, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Condition:</Text>
                  <Text style={styles.value}>{record.condition || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Diagnosed:</Text>
                  <Text style={styles.value}>
                    {record.diagnosedAt ? new Date(record.diagnosedAt).toLocaleDateString() : "N/A"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{record.status || "N/A"}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Allergies */}
        {patientData?.allergies && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <Text style={styles.value}>
              {patientData.allergies || "None recorded"}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Confidential Medical Document</Text>
          <Text>Generated by Healthcare System on {generationDate}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default FullPatientPDFReport;