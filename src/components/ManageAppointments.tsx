import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Input,
  Text,
  Flex,
  Spacer,
  Select as ChakraSelect,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import Select from "react-select";
import axios from "axios";

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10;

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [updatedDoctor, setUpdatedDoctor] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [updatedTime, setUpdatedTime] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/appointments"
      );
      if (response.data.success) setAppointments(response.data.data);
      else setError("Failed to load appointments: " + response.data.message);
    } catch (err) {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/doctors");
      if (res.data.success) setDoctors(res.data.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/patients");
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const isWeekday = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  const isWithinWorkingHours = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480 && totalMinutes <= 1020;
  };

  const handleEditClick = (appt) => {
    setEditingAppointment(appt);
    setUpdatedDoctor(appt.doctor_id);
    setUpdatedDate(appt.date.split("T")[0]);
    setUpdatedTime(appt.time);
    onEditOpen();
  };

  const handleUpdateAppointment = async () => {
    if (!updatedDoctor || !updatedDate || !updatedTime)
      return alert("All fields are required.");
    if (!isWeekday(updatedDate))
      return alert("Appointments must be scheduled Monday to Friday.");
    if (!isWithinWorkingHours(updatedTime))
      return alert("Appointments must be between 8:00 AM and 5:00 PM.");

    try {
      const res = await axios.put(
        `http://localhost:5000/api/appointments/${editingAppointment.appointment_id}`,
        {
          doctor_id: updatedDoctor,
          date: updatedDate,
          time: updatedTime,
        }
      );
      if (res.data.success) {
        alert("Appointment updated successfully!");
        onEditClose();
        fetchAppointments();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error updating appointment:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to update appointment.");
      }
    }
  };
  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/appointments/${appointmentId}`
      );
      if (res.data.success) {
        setAppointments(
          appointments.filter((a) => a.appointment_id !== appointmentId)
        );
      } else {
        alert("Failed to delete appointment: " + res.data.message);
      }
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Error deleting appointment.");
    }
  };

  const handleAddAppointment = async () => {
    if (!selectedPatient || !updatedDoctor || !updatedDate || !updatedTime)
      return alert("All fields are required.");
    if (!isWeekday(updatedDate))
      return alert("Appointments must be scheduled Monday to Friday.");
    if (!isWithinWorkingHours(updatedTime))
      return alert("Appointments must be between 8:00 AM and 5:00 PM.");

    try {
      const res = await axios.post("http://localhost:5000/api/appointments", {
        patient_id: selectedPatient.patient_id,
        doctor_id: updatedDoctor,
        date: updatedDate,
        time: updatedTime,
      });
      if (res.data.success) {
        alert("Appointment added successfully!");
        onAddClose();
        fetchAppointments();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error adding appointment:", err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to add appointment.");
      }
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "white",
      color: "black",
      borderColor: "#CBD5E0",
      boxShadow: "none",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e6f7ff" : "white",
      color: "black",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: "black",
    }),
  };

  const filteredAppointments = selectedDate
    ? appointments.filter((a) => a.date.split("T")[0] === selectedDate)
    : appointments;

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <Box minHeight="100vh" bg="teal.700" p={6} color="white" width="100vw">
      <Flex justifyContent="center">
        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="xl"
          width="95%"
          maxWidth="1400px"
        >
          <Heading size="lg" mb={6} textAlign="center" color="gray.800">
            Manage Appointments
          </Heading>

          <Flex mb={6} align="center">
            <Button
              colorScheme="green"
              size="md"
              borderRadius="full"
              px={6}
              fontWeight="bold"
              onClick={onAddOpen}
            >
              + Add New Appointment
            </Button>
            <Spacer />
            <Flex align="center">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                width="200px"
                borderColor="gray.400"
                bg="white"
                color="black"
                mr={4}
              />
              <Button
                colorScheme="blue"
                size="md"
                borderRadius="full"
                px={4}
                onClick={() => setSelectedDate("")}
              >
                Clear Date
              </Button>
            </Flex>
          </Flex>

          {loading ? (
            <Spinner size="lg" />
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <>
              <Table variant="simple" colorScheme="blackAlpha" width="100%">
                <Thead>
                  <Tr bg="teal.500">
                    <Th color="white">Patient Name</Th>
                    <Th color="white">DOB</Th>
                    <Th color="white">Phone</Th>
                    <Th color="white">Email</Th>
                    <Th color="white">Doctor</Th>
                    <Th color="white">Date</Th>
                    <Th color="white">Time</Th>
                    <Th color="white">Status</Th>
                    <Th color="white">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentAppointments.map((appt, index) => (
                    <Tr
                      key={index}
                      bg={index % 2 === 0 ? "gray.100" : "gray.200"}
                    >
                      <Td color="gray.800">{appt.patient_name}</Td>
                      <Td color="gray.800">{appt.dob.split("T")[0]}</Td>
                      <Td color="gray.800">{appt.phone_number}</Td>
                      <Td color="gray.800">{appt.email}</Td>
                      <Td color="gray.800">{appt.doctor_name}</Td>
                      <Td color="gray.800">{appt.date.split("T")[0]}</Td>
                      <Td color="gray.800">{appt.time}</Td>
                      <Td color="gray.800">{appt.status}</Td>
                      <Td>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          px={4}
                          mr={2}
                          onClick={() => handleEditClick(appt)}
                        >
                          Edit
                        </Button>
                        <Button
                          colorScheme="red"
                          size="sm"
                          px={4}
                          onClick={() => handleDelete(appt.appointment_id)}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Flex mt={4} justifyContent="center" gap={2}>
                {/* Previous button */}
                <Button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  size="sm"
                  bg={currentPage === 1 ? "gray.300" : "teal.400"}
                  color="white"
                  _hover={{ bg: "teal.500" }}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      colorScheme={currentPage === pageNumber ? "teal" : "gray"}
                      variant={currentPage === pageNumber ? "solid" : "outline"}
                      size="sm"
                      bg={currentPage === pageNumber ? "teal.500" : "gray.200"}
                      color={currentPage === pageNumber ? "white" : "black"}
                      _hover={{
                        bg:
                          currentPage === pageNumber ? "teal.600" : "gray.300",
                      }}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                {/* Next button */}
                <Button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  size="sm"
                  bg={currentPage === totalPages ? "gray.300" : "teal.400"}
                  color="white"
                  _hover={{ bg: "teal.500" }}
                >
                  Next
                </Button>
              </Flex>

              {/* Add Modal */}
              <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>New Appointment</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Select
                      options={patients.map((p) => ({
                        value: p.patient_id,
                        label: `${p.name} | ${p.dob.split("T")[0]} | ${
                          p.phone_number
                        }`,
                        data: p,
                      }))}
                      onChange={(option) => setSelectedPatient(option?.data)}
                      placeholder="Search and select a patient..."
                      isSearchable
                      styles={customSelectStyles}
                    />

                    <ChakraSelect
                      value={updatedDoctor}
                      onChange={(e) => setUpdatedDoctor(e.target.value)}
                      mb={4}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc) => (
                        <option key={doc.user_id} value={doc.user_id}>
                          {doc.username}
                        </option>
                      ))}
                    </ChakraSelect>

                    <Input
                      type="date"
                      value={updatedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setUpdatedDate(e.target.value)}
                      mb={4}
                    />

                    <Input
                      type="time"
                      value={updatedTime}
                      onChange={(e) => setUpdatedTime(e.target.value)}
                      mb={4}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      colorScheme="green"
                      mr={3}
                      onClick={handleAddAppointment}
                    >
                      Add
                    </Button>
                    <Button onClick={onAddClose}>Cancel</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Edit Modal */}
              <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Edit Appointment</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <ChakraSelect
                      value={updatedDoctor}
                      onChange={(e) => setUpdatedDoctor(e.target.value)}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc) => (
                        <option key={doc.user_id} value={doc.user_id}>
                          {doc.username}
                        </option>
                      ))}
                    </ChakraSelect>

                    <Input
                      type="date"
                      value={updatedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setUpdatedDate(e.target.value)}
                      mt={4}
                    />

                    <Input
                      type="time"
                      value={updatedTime}
                      onChange={(e) => setUpdatedTime(e.target.value)}
                      mt={4}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={handleUpdateAppointment}
                    >
                      Update
                    </Button>
                    <Button onClick={onEditClose}>Cancel</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ManageAppointments;
