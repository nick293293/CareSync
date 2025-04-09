import React, { useState } from "react";
import { ArrowBackIcon, QuestionIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, FormControl, FormLabel, Input, Text, Alert, AlertIcon, useToast } from "@chakra-ui/react";
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
  
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (Object.values(userData).some(value => value.trim() === "")) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/add-user", userData);
      toast({
        title: "Success!",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setUserData({ username: "", password: "", role: "", phone: "", email: "" });
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
    <Flex height="100vh" width="100vw" bg="teal.600" align="center" justify="center">
      {/* Back Button */}
      <Button position="absolute" top="20px" left="20px" onClick={() => navigate(-1)}>
        <ArrowBackIcon boxSize={7} />
      </Button>


      <Box bg="white" p={8} borderRadius="lg" width={700}>
        <Text fontSize="2xl" fontWeight="bold" color="teal.700" mb="4">Add User</Text>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel color="gray.700">Username</FormLabel>
            <Input name="username" value={userData.username} onChange={handleChange} color="black" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gray.700">Password</FormLabel>
            <Input type="password" name="password" value={userData.password} onChange={handleChange} color="black" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gray.700">Role</FormLabel>
            <Input name="role" value={userData.role} onChange={handleChange} placeholder="admin/staff" color="black" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gray.700">Phone</FormLabel>
            <Input name="phone" value={userData.phone} onChange={handleChange} color="black" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="gray.700">Email</FormLabel>
            <Input name="email" value={userData.email} onChange={handleChange} color="black" />
          </FormControl>
          <Button type="submit" colorScheme="teal" mt={4} width="full">Add User</Button>
        </form>
      </Box>
    </Flex>
  );
};

export default AddUser;