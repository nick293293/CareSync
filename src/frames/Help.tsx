import React, { useState } from "react";
import { ArrowBackIcon, QuestionIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Help: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/send-email", formData);
      toast({
        title: "Success!",
        description: "Your message has been sent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
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
      {/* Back Button */}
      <Button
        position="absolute"
        top="20px"
        left="20px"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon boxSize={7} />
      </Button>

      {/* FAQ Button */}
      <Button
        position="absolute"
        top="20px"
        right="20px"
        colorScheme="teal"
        onClick={() => navigate("/faq")}
      >
        <QuestionIcon boxSize={5} mr={2} /> FAQ
      </Button>

      <Box bg="white" p={8} borderRadius="lg" width={700} height={500}>
        <Text fontSize="2xl" fontWeight="bold" color="teal.700" mb="4">
          Contact Us
        </Text>
        <form onSubmit={handleSubmit}>
          <FormControl id="firstName" isRequired>
            <FormLabel color="gray.700">First Name</FormLabel>
            <Input
              value={formData.firstName}
              color="black"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl id="lastName" isRequired>
            <FormLabel color="gray.700">Last Name</FormLabel>
            <Input
              value={formData.lastName}
              onChange={handleChange}
              color="black"
            />
          </FormControl>
          <FormControl id="email" isRequired>
            <FormLabel color="gray.700">Email</FormLabel>
            <Input
              type="email"
              value={formData.email}
              onChange={handleChange}
              color="black"
            />
          </FormControl>
          <FormControl id="message" isRequired>
            <FormLabel color="gray.700">Message</FormLabel>
            <Textarea
              value={formData.message}
              color="black"
              onChange={handleChange}
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" mt={4} width="full">
            Send Message
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Help;
