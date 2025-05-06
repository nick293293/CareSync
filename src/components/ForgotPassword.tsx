import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendResetEmail = () => {
    if (!email) {
      setError("Email is required.");
      return;
    }

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage("Password reset email sent successfully.");
        setError("");
      })
      .catch((err) => {
        setError("Failed to send reset email. Please try again.");
      });
  };

  return (
    <Flex height="100vh" align="center" justify="center" bg="blue.50">
      <Box
        bg="white"
        p="8"
        borderRadius="md"
        shadow="md"
        width={{ base: "90%", md: "400px" }}
      >
        <Text fontSize="2xl" fontWeight="bold" mb="6" textAlign="center">
          Forgot Password
        </Text>

        <FormControl id="email" isRequired mb="4">
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            focusBorderColor="teal.500"
          />
        </FormControl>

        <Button colorScheme="teal" width="full" onClick={handleSendResetEmail}>
          Send Password Reset Email
        </Button>

        {message && (
          <Text mt="4" color="green.600" textAlign="center">
            {message}
          </Text>
        )}
        {error && (
          <Text mt="4" color="red.600" textAlign="center">
            {error}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default ForgotPassword;
