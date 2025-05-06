import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Icon,
  Image,
} from "@chakra-ui/react";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import for navigation

const StaffLogin = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate(); // Hook for navigation

  // Function to handle login
  const handleLogin = () => {
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    axios
      .post("http://localhost:5000/api/login", {
        username,
        password,
      })
      .then((response) => {
        console.log("API Response:", response.data);

        if (response.data.success) {
          localStorage.setItem("token", "true");
          navigate("/staff");
        }
      })
      .catch((error) => {
        // Handle error response
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message || "Invalid username or password"
          );
        } else {
          setError("An unexpected error occurred");
        }
      });
  };

  const handleAdmin = () => {
    navigate("/adminLogin");
  };
  const handleForgot = () => {
    navigate("/forgotpassword");
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      bg="blue.50"
      direction={{ base: "column", md: "row" }}
      position="relative"
      onKeyDown={handleKeyPress}
    >
      {/* Admin and Help Buttons in Bottom-Right */}
      <Box
        position="absolute"
        bottom={4}
        right={4}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Button colorScheme="teal" size="sm" onClick={handleAdmin}>
          Admin
        </Button>
        <Button
          colorScheme="teal"
          size="sm"
          variant="outline"
          borderColor="teal.500"
          _hover={{ bg: "teal.50" }}
          onClick={() => navigate("/help")} // Navigate to the Help page
        >
          Help
        </Button>
      </Box>

      {/* Left Section (Image) */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={{ base: "40%", md: "100%" }}
      >
        <Image
          src="/main_pic.png"
          alt="Staff Illustration"
          maxHeight={{ base: "60%", md: "80%" }}
          objectFit="contain"
        />
      </Box>

      {/* Right Section (Login Card) */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={{ base: "60%", md: "100%" }}
        p={{ base: 4, md: 8 }}
      >
        <Box
          bg="white"
          p={{ base: 4, md: 8 }}
          borderRadius="md"
          shadow="md"
          maxWidth="400px"
          width="100%"
        >
          {/* Title */}
          <Heading as="h2" size="lg" mb={4} textAlign="center" color="gray.700">
            Staff Login
          </Heading>
          <Text textAlign="center" mb={6} color="gray.600">
            Please enter your username and password to continue
          </Text>

          {/* Username Input */}
          <InputGroup mb={4}>
            <InputLeftElement
              children={<Icon as={FaUser} color="gray.400" />}
            />
            <Input
              placeholder="Username"
              variant="filled"
              bg="gray.50"
              _hover={{ bg: "gray.100" }}
              _focus={{ bg: "white", borderColor: "teal.500" }}
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </InputGroup>

          {/* Password Input */}
          <InputGroup mb={6}>
            <InputLeftElement
              children={<Icon as={FaLock} color="gray.400" />}
            />
            <Input
              placeholder="Password"
              type="password"
              variant="filled"
              bg="gray.50"
              _hover={{ bg: "gray.100" }}
              _focus={{ bg: "white", borderColor: "teal.500" }}
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>

          {/* Login Button */}
          <Button
            colorScheme="teal"
            size="lg"
            width="100%"
            onClick={handleLogin}
          >
            Login
          </Button>

          {/* Error Message */}
          {error && (
            <Text textAlign="center" mt={4} color="red.600">
              {error}
            </Text>
          )}

          {/* Forgot Password Button */}
          <Button
            marginY="25px"
            colorScheme="blue"
            size="md"
            width="100%"
            onClick={handleForgot}
          >
            Forgot Password?
          </Button>
        </Box>
      </Box>
    </Flex>
  );
};

export default StaffLogin;
