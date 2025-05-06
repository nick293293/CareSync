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
//import PatientLookup from "../components/PatientLookup.jsx";
import { format } from "date-fns";

// Define interfaces for better TypeScript support
interface Appointment {
  appointment_id: number;
}

interface AppointmentDetails {
  appointment_id: number;
  time: string;
  doctor_id: number;
  patient_name: string;
  patient_phone: string;
}

// Import Patient Lookup Component

const StaffPage = () => {
  const navigate = useNavigate();
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>(
    []
  );

  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    name: string;
    dob: string;
    address: string;
    phone_number: string;
    email: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientNames, setPatientNames] = useState<{ [key: number]: string }>(
    {}
  );

  const {
    isOpen: isLookupOpen,
    onOpen: openLookup,
    onClose: closeLookup,
  } = useDisclosure();

  const handleShowPatientInfo = async (patientId: number) => {
    const result = await getPatient(patientId);
    if (result && result.success) {
      setSelectedPatient({
        id: result.data.patient_id,
        name: result.data.name,
        dob: result.data.dob,
        address: result.data.address,
        phone_number: result.data.phone_number,
        email: result.data.email,
      });
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      const uniquePatientIds = [
        ...new Set(todaysAppointments.map((appt) => appt.patient_id)),
      ];

      const newPatientNames: { [key: number]: string } = { ...patientNames };

      const fetchPromises = uniquePatientIds
        .filter((id) => !patientNames[id]) // Only fetch if not already in state
        .map(async (id) => {
          const result = await getPatient(id);
          if (result && result.success && result.data?.name) {
            newPatientNames[id] = result.data.name;
          }
        });

      await Promise.all(fetchPromises);

      setPatientNames((prev) => ({ ...prev, ...newPatientNames }));
    };

    if (todaysAppointments.length > 0) {
      fetchPatients();
    }
  }, [todaysAppointments]);

  interface Appointment {
    appointment_id: number;
    patient_id: number;
    doctor_id: number;
    date: string;
    time: string;
    status: string;
  }

  const {
    isOpen: isAppsOpen,
    onOpen: openApps,
    onClose: closeApps,
  } = useDisclosure();

  const getPatient = async (patientId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/getPatient/${patientId}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error("Error fetching patient");
      }

      return result; // Returns { success: true, data: { patient_id, name, ... } }
    } catch (error) {
      console.error("Error fetching patient:", error);
      return null;
    }
  };

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get<{ data: Appointment[] }>(
          "http://localhost:5000/api/todays-appointments"
        );
        setTodaysAppointments(response.data.data); // ✅ No more TypeScript error
        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments.");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleManageAppointments = () => {
    navigate("/manage-appointments");
  };

  return (
    <Flex
      align="center"
      justify="center"
      bg="blue.50"
      minHeight="100vh"
      width="100vw"
      overflow="hidden"
    >
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
        {/* Logout Button */}
        <Box position="absolute" top={4} right={4} display="flex" gap={4}>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {/* Staff Home Heading */}
        <Heading as="h1" size="xl" mb={4} textAlign="center" color="gray.700">
          Staff Home
        </Heading>
        <Text textAlign="center" mb={6} color="gray.600" fontSize="lg">
          Welcome, Doctor! Here's an overview of your tasks.
        </Text>

        <Stack spacing={6}>
          {/* Today's Appointments Widget */}
          <Box
            bg="gray.100"
            p={6}
            borderRadius="md"
            shadow="sm"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Today's Appointments
            </Heading>

            {/* Show Loading or Error Messages */}
            {loading ? (
              <Spinner size="lg" color="teal.500" />
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <>
                <Text color="gray.600">
                  {todaysAppointments.length} Appointments Scheduled
                </Text>
                <Button mt={4} colorScheme="teal" size="sm" onClick={openApps}>
                  View Details
                </Button>
              </>
            )}
          </Box>

          {/* Look Up Patient Widget */}
          <Box
            bg="gray.100"
            p={6}
            borderRadius="md"
            shadow="sm"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Look Up Patient
            </Heading>
            <Text color="gray.600">Find patient information quickly.</Text>
            <Button mt={4} colorScheme="teal" size="sm" onClick={openLookup}>
              Look Up
            </Button>
          </Box>

          {/* Manage Appointments Widget */}
          <Box
            bg="gray.100"
            p={6}
            borderRadius="md"
            shadow="sm"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Manage Appointments
            </Heading>
            <Text color="gray.600">View and organize all appointments.</Text>
            <Button
              mt={4}
              colorScheme="teal"
              size="sm"
              onClick={handleManageAppointments}
            >
              Manage Appointments
            </Button>
            {/* Appointments Modal */}
            <Modal isOpen={isAppsOpen} onClose={closeApps}>
              <ModalOverlay />
              <ModalContent maxWidth="600px" width="90%">
                <ModalHeader>
                  Today's Appointments -{" "}
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {todaysAppointments.length > 0 ? (
                    <Stack spacing={3}>
                      {todaysAppointments.map((appt) => (
                        <Box
                          key={appt.appointment_id}
                          p={4}
                          bg="gray.500"
                          borderRadius="md"
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="bold">
                                Patient ID: {appt.patient_id}
                              </Text>
                              <Text fontWeight="bold">
                                Name:{" "}
                                {patientNames[appt.patient_id] || "Loading..."}
                              </Text>
                              <Text>
                                Time:{" "}
                                {new Date(
                                  `1970-01-01T${appt.time}`
                                ).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </Text>
                              <Text>Status: {appt.status}</Text>
                            </Box>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() =>
                                handleShowPatientInfo(appt.patient_id)
                              }
                            >
                              Show Patient Full Info
                            </Button>
                          </Flex>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text>No appointments for today.</Text>
                  )}

                  {/* Show Patient Full Info Below the List */}
                  {selectedPatient && (
                    <Box
                      mt={6}
                      p={4}
                      bg="gray.500"
                      borderRadius="md"
                      position="relative"
                    >
                      {/* Close Button */}
                      <Button
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top="5px"
                        right="5px"
                        onClick={() => setSelectedPatient(null)}
                      >
                        ✕
                      </Button>

                      <Text fontWeight="bold" mb={2}>
                        Full Patient Info
                      </Text>
                      <Text>
                        <strong>ID:</strong> {selectedPatient.id}
                      </Text>
                      <Text>
                        <strong>Name:</strong> {selectedPatient.name}
                      </Text>
                      <Text>
                        <strong>DOB:</strong>{" "}
                        {new Date(selectedPatient.dob).toLocaleDateString()}
                      </Text>
                      <Text>
                        <strong>Address:</strong> {selectedPatient.address}
                      </Text>
                      <Text>
                        <strong>Phone:</strong> {selectedPatient.phone_number}
                      </Text>
                      <Text>
                        <strong>Email:</strong> {selectedPatient.email}
                      </Text>
                    </Box>
                  )}
                </ModalBody>

                <ModalFooter>
                  <Button onClick={closeApps}>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Stack>
      </Box>
      {/* Include the Patient Lookup Component */}
    </Flex>
  );
};

export default StaffPage;
