import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface User {
  username: string;
  email: string;
  phone: string;
  role: string;
}

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [userData, setUserData] = useState<User>({
    username: "",
    email: "",
    phone: "",
    role: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://caresync-psh6.onrender.com/api/getUser/${id}`)
      .then((res) => {
        setUserData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        toast({
          title: "Error",
          description: "Failed to fetch user details.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
      });
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });

    // Real-time validation
    if (name === "role") {
      const validRoles = ["admin", "doctor", "nurse"];
      setValidationErrors((prev) => ({
        ...prev,
        role: validRoles.includes(value.toLowerCase())
          ? ""
          : "Role must be Admin, Doctor, or Nurse",
      }));
    }

    if (name === "phone") {
      const phoneRegex = /^\d{10}$/;
      setValidationErrors((prev) => ({
        ...prev,
        phone: phoneRegex.test(value)
          ? ""
          : "Phone must be exactly 10 digits (e.g., 1234567890)",
      }));
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidationErrors((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "" : "Invalid email format",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting updated user:", userData);

    if (Object.values(userData).some((v) => String(v).trim() === "")) {
      toast({
        title: "Validation Error",
        description: "All fields must be filled.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (Object.values(validationErrors).some((msg) => msg !== "")) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    axios
      .put(`https://caresync-psh6.onrender.com/api/update-user/${id}`, userData)
      .then((res) => {
        toast({
          title: "Success!",
          description: res.data.message,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        navigate(-1);
      })
      .catch((err) => {
        console.error("Update error:", err);
        toast({
          title: "Error",
          description: "Failed to update user.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      bg="teal.600"
      align="center"
      justify="center"
    >
      <Button
        position="absolute"
        top="20px"
        left="20px"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon boxSize={7} />
      </Button>

      <Box bg="white" p={8} borderRadius="lg" width={700}>
        <Text fontSize="2xl" fontWeight="bold" color="teal.700" mb="4">
          Edit User
        </Text>

        {loading ? (
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel color="gray.700">Username</FormLabel>
              <Input
                name="username"
                value={userData.username}
                onChange={handleChange}
                color="black"
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel color="gray.700">Email</FormLabel>
              <Input
                name="email"
                value={userData.email}
                onChange={handleChange}
                color="black"
              />
              {validationErrors.email && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {validationErrors.email}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel color="gray.700">Phone</FormLabel>
              <Input
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                maxLength={10}
                color="black"
              />
              {validationErrors.phone && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {validationErrors.phone}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel color="gray.700">Role</FormLabel>
              <Input
                name="role"
                value={userData.role}
                onChange={handleChange}
                placeholder="admin, doctor, or nurse"
                color="black"
              />
              {validationErrors.role && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {validationErrors.role}
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              mt={6}
              width="full"
              isDisabled={Object.values(validationErrors).some(
                (msg) => msg !== ""
              )}
            >
              Save Changes
            </Button>
          </form>
        )}
      </Box>
    </Flex>
  );
};

export default EditUser;
