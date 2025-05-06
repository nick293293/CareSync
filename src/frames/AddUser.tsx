import React, { useState } from "react";
import { ArrowBackIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  username: string;
  password: string;
  role: string;
  phone: string;
  email: string;
}

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [userData, setUserData] = useState<User>({
    username: "",
    password: "",
    role: "",
    phone: "",
    email: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [validationErrors, setValidationErrors] = useState({
    role: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));

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
        phone: phoneRegex.test(value) ? "" : "Format must be ##########",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(userData).some((value) => value.trim() === "")) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (Object.values(validationErrors).some((msg) => msg !== "")) {
      toast({
        title: "Validation Error",
        description: "Please fix input errors before submitting.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://caresync-psh6.onrender.com/api/add-user",
        userData
      );
      toast({
        title: "Success!",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setUserData({
        username: "",
        password: "",
        role: "",
        phone: "",
        email: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
          Add User
        </Text>
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
            <FormLabel color="gray.700">Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handleChange}
                color="black"
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
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

          <FormControl isRequired mt={4}>
            <FormLabel color="gray.700">Phone</FormLabel>
            <Input
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              placeholder="Format: ##########"
              color="black"
            />
            {validationErrors.phone && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors.phone}
              </Text>
            )}
          </FormControl>

          <FormControl isRequired mt={4}>
            <FormLabel color="gray.700">Email</FormLabel>
            <Input
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="your-email@example.com"
              color="black"
            />
            {validationErrors.email && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors.email}
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
            Add User
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default AddUser;
