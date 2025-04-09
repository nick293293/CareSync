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
import { FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(false); // Loading state for API request
  const navigate = useNavigate(); 

  // Function to handle password reset request
  const [isError, setIsError] = useState(false); // New state for error handling
  
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email address.");
      setIsError(true); // Indicate this is an error message
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/forgot-password", { email });
  
      setMessage(response.data.message || "Check your email for reset instructions.");
      setIsError(false); // Mark as a success message
    } catch (error) {
      let errorMessage = "An error occurred. Try again later.";
  
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      setMessage(errorMessage);
      setIsError(true); // Mark as an error message
    }
  
    setLoading(false);
  };
  

  return (
    <Flex
      height="100vh"
      width="100vw"
      bg="blue.50"
      direction={{ base: "column", md: "row" }}
      position="relative"
    >
      {/* Left Section (Image) */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={{ base: "40%", md: "100%" }}
      >
        <Image
          src="/doctor question.png"
          alt="Forgot Password Illustration"
          maxHeight={{ base: "60%", md: "80%" }}
          objectFit="contain"
        />
      </Box>

      {/* Right Section (Reset Card) */}
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
            Forgot Password
          </Heading>
          <Text textAlign="center" mb={6} color="gray.600">
            Enter your email address, and we'll send you a link to reset your password.
          </Text>

          {/* Email Input */}
          <InputGroup mb={4}>
            <InputLeftElement children={<Icon as={FaEnvelope} color="gray.400" />} />
            <Input
              placeholder="Email Address"
              type="email"
              variant="filled"
              bg="gray.50"
              _hover={{ bg: "gray.100" }}
              _focus={{ bg: "white", borderColor: "teal.500" }}
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>

          {/* Reset Password Button */}
          <Button
            colorScheme="teal"
            size="lg"
            width="100%"
            onClick={handleForgotPassword}
            isLoading={loading}
          >
            Send Reset Link
          </Button>

          {/* Message Display */}
          {message && (
            <Text textAlign="center" mt={4} color={isError ? "red.600" : "green.600"}>
            {message}
          </Text>          
          )}

          {/* Back to Login Button */}
          <Button
            mt={4}
            colorScheme="blue"
            size="md"
            width="100%"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </Flex>
  );
};

export default ForgotPage;
