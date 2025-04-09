import React, { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, FormControl, FormLabel, Input, Text, useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/reset-password", { token, newPassword });
      toast({
        title: "Success!",
        description: "Your password has been reset.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex height="100vh" width="100vw" bg="teal.600" align="center" justify="center">


      <Box bg="white" p={8} borderRadius="lg" width={700}>
        <Text fontSize="2xl" fontWeight="bold" color="teal.700" mb="4" textAlign="center">
          Reset Password
        </Text>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel color="gray.700">New Password</FormLabel>
            <Input type="password" value={newPassword} onChange={handleChange} color="black" />
          </FormControl>
          <Button type="submit" colorScheme="teal" mt={4} width="full">
            Reset Password
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default ResetPasswordPage;