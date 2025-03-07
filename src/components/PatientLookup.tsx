import React, { useState } from "react";
import axios from "axios";

import {
  Input,
  Button,
  Box,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
interface PatientLookupProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Patient {
  patient_id: number;
  name: string;
  dob: string;
  address: string;
  phone_number: string;
  email: string;
}


const PatientLookup: React.FC<PatientLookupProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]); //  Now TypeScript knows it's an array of Patients
  const [error, setError] = useState("");
  const [newPatient, setNewPatient] = useState<Patient>({
    patient_id: 0,
    name: "",
    dob: "",
    address: "",
    phone_number: "",
    email: "",
  });
  const [selectedPatientReports, setSelectedPatientReports] = useState<any[]>([]);
  const [showReports, setShowReports] = useState<number | null>(null);

  const toast = useToast();


  // 🔹 Search Patients
  const searchPatients = async () => {
    if (!query.trim()) {
      setError("Enter patient name or ID");
      return;
    }

    setError("");

    try {
      const response = await axios.get(`http://localhost:5000/api/patients?query=${query}`);
      if (response.data.success) {
        setPatients(response.data.data);
      } else {
        setError(response.data.message);
        setPatients([]);
      }
    } catch (err) {
      setError("Error searching for patient");
      console.error(" Patient lookup error:", err);
    }
  };

  // 🔹 Add Patient
  const addPatient = async () => {
    try {
      // Ensure DOB is in 'YYYY-MM-DD' format
      const formattedDob = new Date(newPatient.dob).toISOString().split("T")[0];
  
      const response = await axios.post("http://localhost:5000/api/patients", {
        ...newPatient,
        dob: formattedDob, //  Fix: Correct date format
      });
  
      console.log(" API Response:", response.data);
  
      if (response.data.success) {
        toast({ title: "New Patient was added", status: "success", duration: 3000, isClosable: true });
        searchPatients(); // Refresh list
        setNewPatient({ patient_id: 0, name: "", dob: "", address: "", phone_number: "", email: "" });
      } else {
        console.error(" API Error:", response.data.message);
        setError(response.data.message);
      }
    } catch (err: unknown) { // Explicitly mark `err` as `unknown`
      if (err instanceof Error) {
        console.error(" Axios Error:", err.message); // Access error message safely
        setError(`Error adding patient: ${err.message}`);
      } else {
        console.error(" Unknown Error:", err);
        setError("An unexpected error occurred.");
      }
    }
  };
  const fetchMedicalReports = async (patientId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${patientId}/medical-reports`);
  
      if (response.data.success) {
        setSelectedPatientReports(response.data.data);
        setShowReports(patientId); // Show reports for this specific patient
      } else {
        setSelectedPatientReports([]);
        console.warn("⚠️ No reports found.");
      }
    } catch (err) {
      console.error("Error fetching medical reports:", err);
    }
  };
  

  // 🔹 Remove Patient
  const removePatient = async (patientId: number) => {  // Fix: Explicitly set type
    try {
      await axios.delete(`http://localhost:5000/api/patients/${patientId}`);
      toast({ title: "Patient removed successfully", status: "info", duration: 3000, isClosable: true });
      searchPatients(); // Refresh list
    } catch (err) {
      setError("Error removing patient");
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Look Up Patient</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* 🔹 Search Section */}
          <Input
            placeholder="Enter Patient Name or ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            mb={3}
          />
          <Button colorScheme="blue" onClick={searchPatients}>
            Search
          </Button>

          {error && <Text color="red.500" mt={3}>{error}</Text>}

          {/* 🔹 Patient List */}
          <VStack mt={4} spacing={3} align="start">
            {patients.map((patient) => (
              <Box key={patient.patient_id} p={3} borderWidth="1px" borderRadius="md">
                <Text fontWeight="bold">{patient.name}</Text>
                <Text>ID: {patient.patient_id}</Text>
                <Text>Date of Birth: {new Date(patient.dob).toLocaleDateString()}</Text>
                <Text>Address: {patient.address}</Text>
                <Text>Phone: {patient.phone_number}</Text>
                <Text>Email: {patient.email}</Text>
                
                {/* 🔹 Buttons for Remove & View Reports */}
                <Button colorScheme="red" size="sm" mt={2} onClick={() => removePatient(patient.patient_id)}>
                  Remove Patient
                </Button>
                <Button colorScheme="blue" size="sm" mt={2} onClick={() => fetchMedicalReports(patient.patient_id)}>
               View Medical Reports
               </Button>
{/*  Show Medical Reports Below Patient Details */}
{showReports === patient.patient_id && (
  <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
    <Text fontWeight="bold">Medical Reports:</Text>
    {selectedPatientReports.length > 0 ? (
      selectedPatientReports.map((report) => (
        <Box key={report.report_id} p={3} borderWidth="1px" borderRadius="md" mt={2} bg="white">
          <Text fontWeight="bold">{report.title}</Text>
          <Text>{report.details}</Text>
          <Text fontSize="sm" color="gray.500">
            Date: {new Date(report.report_date).toLocaleDateString()}
          </Text>
        </Box>
      ))
    ) : (
      <Text>No medical reports found.</Text>
    )}
    {/*  Add a "Close Reports" button */}
    <Button colorScheme="red" size="sm" mt={3} onClick={() => setShowReports(null)}>
      Close Reports
    </Button>
  </Box>
)}
              </Box>
            ))}
          </VStack>
 {/* Add Patient Section */}
          <Text fontWeight="bold" mt={5}>Add New Patient</Text>
          <Input placeholder="Name" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} mb={2} />
          <Input placeholder="Date of Birth" type="date" value={newPatient.dob} onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })} mb={2} />
          <Input placeholder="Address" value={newPatient.address} onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} mb={2} />
          <Input placeholder="Phone" value={newPatient.phone_number} onChange={(e) => setNewPatient({ ...newPatient, phone_number: e.target.value })} mb={2} />
          <Input placeholder="Email" type="email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} mb={2} />
          <Button colorScheme="green" onClick={addPatient} mt={2}>
            Add Patient
          </Button>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PatientLookup;
