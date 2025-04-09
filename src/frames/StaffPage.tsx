import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PatientLookup from "../components/PatientLookup";

interface StaffPageProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface Appointment {
  patient_id: number;
}

const StaffPage: React.FC<StaffPageProps> = ({ isOpen, onOpen, onClose }) => {
  const navigate = useNavigate();
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientNames, setPatientNames] = useState<{ [key: number]: string }>({});

  const {
    isOpen: isAppsOpen,
    onOpen: openApps,
    onClose: closeApps,
  } = useDisclosure();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get<{ data: Appointment[] }>(
          "http://localhost:5000/api/todays-appointments"
        );
        setTodaysAppointments(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments.");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      const newPatientNames: { [key: number]: string } = {};

      for (const appt of todaysAppointments) {
        if (!patientNames[appt.patient_id]) {
          const result = await getPatient(appt.patient_id);
          if (result && result.success) {
            newPatientNames[appt.patient_id] = result.data.name;
          }
        }
      }

      setPatientNames((prev) => ({ ...prev, ...newPatientNames }));
    };

    if (todaysAppointments.length > 0) {
      fetchPatients();
    }
  }, [todaysAppointments]);

  const getPatient = async (patientId: number) => {
    try {
      const response = await fetch(`/api/getPatient/${patientId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error fetching patient");
      return result;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleManageAppointments = () => {
    navigate("/manage-appointments");
  };

  return (
    <Flex align="center" justify="center" bg="gray.50" minHeight="100vh" width="100vw">
      <Box
        bg="white"
        p={{ base: 6, md: 12 }}
        borderRadius="md"
        shadow="lg"
        width="100%"
        maxWidth="800px"
        mx="auto"
        position="relative"
      >
        <Box position="absolute" top={4} right={4} display="flex" gap={4}>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        <Heading as="h1" size="xl" mb={4} textAlign="center" color="gray.700">
          Staff Home
        </Heading>
        <Text textAlign="center" mb={6} color="gray.600" fontSize="lg">
          Welcome, Doctor! Here's an overview of your tasks.
        </Text>

        <Stack spacing={6}>
          <Box bg="gray.100" p={6} borderRadius="md" shadow="sm" textAlign="center">
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Today's Appointments
            </Heading>
            {loading ? (
              <Spinner size="lg" color="teal.500" />
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <>
                <Text color="gray.600">{todaysAppointments.length} Appointments Scheduled</Text>
                <Button mt={4} colorScheme="teal" size="sm" onClick={openApps}>
                  View Details
                </Button>
              </>
            )}
          </Box>

          <Box bg="gray.100" p={6} borderRadius="md" shadow="sm" textAlign="center">
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Look Up Patient
            </Heading>
            <Text color="gray.600">Find patient information quickly.</Text>
            <Button mt={4} colorScheme="teal" size="sm" onClick={onOpen}>
              Look Up
            </Button>
          </Box>

          <Box bg="gray.100" p={6} borderRadius="md" shadow="sm" textAlign="center">
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Manage Appointments
            </Heading>
            <Text color="gray.600">View and organize all appointments.</Text>
            <Button mt={4} colorScheme="teal" size="sm" onClick={handleManageAppointments}>
              Manage Appointments
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Modal for Today's Appointments */}
      <Modal isOpen={isAppsOpen} onClose={closeApps}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Today's Appointments</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {todaysAppointments.length > 0 ? (
              <Stack spacing={3}>
                {todaysAppointments.map((appt, index) => (
                  <Box key={index} p={3} bg="gray.200" borderRadius="md">
                    <Text>{patientNames[appt.patient_id] || "Loading..."}</Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text>No appointments scheduled for today.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={closeApps}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: Patient Lookup */}
      <PatientLookup isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

export default StaffPage;
