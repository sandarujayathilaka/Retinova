declare global {
  type Profile = {
    _id: string;
    patientId: string;
    fullName: string;
    category: ("DR" | "AMD" | "Glaucoma" | "RVO" | "Others")[];
    birthDate: Date;
    gender: "Male" | "Female" | "Other";
    nic: string;
    contactNumber: string;
    email: string;
    bloodType?: string;
    height?: number;
    weight?: number;
    allergies?: string[];
    primaryPhysician?: string;
    address?: string;
    medicalHistory?: Array<MedicalHistory>;
    diagnoseHistory?: Array<Diagnose>;
    patientStatus?:
      | "Pre-Monitoring"
      | "Published"
      | "Review"
      | "Completed"
      | "Monitoring";
    nextVisit?: Date;
    emergencyContact?: EmergencyContact;
    doctorId?: string;
    createdAt: Date;
    updatedAt: Date;
    age?: number;
  };

  type MedicalHistory = {
    condition: string;
    diagnosedAt?: Date;
    medications?: string[];
    date?: Date;
    isChronicCondition?: boolean;
    notes?: string;
    filePaths?: string[];
  };

  type Diagnose = {
    imageUrl: string;
    diagnosis?: string;
    doctorDiagnosis?: string;
    eye?: "LEFT" | "RIGHT";
    uploadedAt?: Date;
    doctorId?: string;
    status?: "Unchecked" | "Completed" | "Checked" | "Test Completed";
    confidenceScores?: number[];
    recommend?: {
      medicine?: string;
      tests?: Array<{
        testName: string;
        status?: "Pending" | "In Progress" | "Completed" | "Reviewed";
        attachmentURL?: string;
        addedAt?: Date;
      }>;
      note?: string;
    };
    revisitTimeFrame?:
      | "Monthly"
      | "Quarterly"
      | "Bi-annually"
      | "Annually"
      | "As needed";
    reviewInfo?: Array<{
      recommendedMedicine?: string;
      notes?: string;
      updatedAt?: Date;
    }>;
  };

  type EmergencyContact = {
    name: string;
    relationship: string;
    phone: string;
  };
}

export {};
