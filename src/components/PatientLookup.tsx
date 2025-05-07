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
  useDisclosure,
  ModalFooter,
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");
  const [newPatient, setNewPatient] = useState<Patient>({
    patient_id: 0,
    name: "",
    dob: "",
    address: "",
    phone_number: "",
    email: "",
  });

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setPdfModalOpen] = useState(false);

  const toast = useToast();

  // Confirmation modal for patient removal
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const [patientToRemove, setPatientToRemove] = useState<Patient | null>(null);

  // Search Patients
  const searchPatients = async () => {
    if (!query.trim()) {
      setError("Enter patient name or ID");
      return;
    }

    setError("");

    try {
      const response = await axios.get(
        `https://caresync-psh6.onrender.com/api/patients?query=${query}`
      );
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

  // Add Patient
  const addPatient = async () => {
    try {
      const formattedDob = new Date(newPatient.dob).toISOString().split("T")[0];
      const response = await axios.post(
        "https://caresync-psh6.onrender.com/api/patients",
        {
          ...newPatient,
          dob: formattedDob,
        }
      );

      if (response.data.success) {
        toast({
          title: "New Patient was added",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        searchPatients();
        setNewPatient({
          patient_id: 0,
          name: "",
          dob: "",
          address: "",
          phone_number: "",
          email: "",
        });
      } else {
        console.error(" API Error:", response.data.message);
        setError(response.data.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(" Axios Error:", err.message);
        setError(`Error adding patient: ${err.message}`);
      } else {
        console.error(" Unknown Error:", err);
        setError("An unexpected error occurred.");
      }
    }
  };

  // Confirm and then remove patient
  const confirmRemovePatient = (patient: Patient) => {
    setPatientToRemove(patient);
    onConfirmOpen();
  };

  // Remove Patient
  const removePatient = async () => {
    if (!patientToRemove) return;
    try {
      await axios.delete(
        `https://caresync-psh6.onrender.com/api/patients/${patientId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast({
        title: "Patient removed successfully",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      searchPatients();
    } catch (err: any) {
      console.error("Error removing patient:", err);
      setError("Error removing patient");
    } finally {
      onConfirmClose();
      setPatientToRemove(null);
    }
  };

  // Download PDF Medical Report
  const handleDownloadPDF = (patientId: number) => {
    window.open(
      `https://caresync-psh6.onrender.com/api/reports/${patientId}/pdf`,
      "_blank"
    );
  };

  // Preview PDF Medical Report
  const handlePreviewPDF = (patientId: number) => {
    const url = `http://localhost:5000/api/reports/${patientId}/pdf`;
    setPdfUrl(url);
    setPdfModalOpen(true);
  };

  return (
    <>
      {/* Patient Lookup Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Look Up Patient</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter Patient Name or ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              mb={3}
            />
            <Button colorScheme="blue" onClick={searchPatients}>
              Search
            </Button>

            {error && (
              <Text color="red.500" mt={3}>
                {error}
              </Text>
            )}

            <VStack mt={4} spacing={3} align="start">
              {patients.map((patient) => (
                <Box
                  key={patient.patient_id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Text fontWeight="bold">{patient.name}</Text>
                  <Text>ID: {patient.patient_id}</Text>
                  <Text>
                    Date of Birth: {new Date(patient.dob).toLocaleDateString()}
                  </Text>
                  <Text>Address: {patient.address}</Text>
                  <Text>Phone: {patient.phone_number}</Text>
                  <Text>Email: {patient.email}</Text>

                  <Button
                    colorScheme="red"
                    size="sm"
                    mt={2}
                    onClick={() => confirmRemovePatient(patient)}
                  >
                    Remove Patient
                  </Button>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    mt={2}
                    ml={2}
                    onClick={() => handlePreviewPDF(patient.patient_id)}
                  >
                    Preview PDF
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    mt={2}
                    ml={2}
                    onClick={() => handleDownloadPDF(patient.patient_id)}
                  >
                    Download PDF
                  </Button>
                </Box>
              ))}
            </VStack>

            {/* Add Patient Section */}
            <Text fontWeight="bold" mt={5}>
              Add New Patient
            </Text>
            <Input
              placeholder="Name"
              value={newPatient.name}
              onChange={(e) =>
                setNewPatient({ ...newPatient, name: e.target.value })
              }
              mb={2}
            />
            <Input
              placeholder="Date of Birth"
              type="date"
              value={newPatient.dob}
              onChange={(e) =>
                setNewPatient({ ...newPatient, dob: e.target.value })
              }
              mb={2}
            />
            <Input
              placeholder="Address"
              value={newPatient.address}
              onChange={(e) =>
                setNewPatient({ ...newPatient, address: e.target.value })
              }
              mb={2}
            />
            <Input
              placeholder="Phone"
              value={newPatient.phone_number}
              onChange={(e) =>
                setNewPatient({ ...newPatient, phone_number: e.target.value })
              }
              mb={2}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newPatient.email}
              onChange={(e) =>
                setNewPatient({ ...newPatient, email: e.target.value })
              }
              mb={2}
            />
            <Button colorScheme="green" onClick={addPatient} mt={2}>
              Add Patient
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview PDF Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                width="100%"
                height="600px"
              />
            ) : (
              <Text>No PDF available</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Confirm Remove Modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to remove{" "}
              <strong>{patientToRemove?.name}</strong>?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={removePatient}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PatientLookup;
