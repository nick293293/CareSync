// src/frames/Unauthorized.tsx
import React from "react";
import { Box, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Flex
      height="100vh"
      width="100vw"
      bg="red.50"
      align="center"
      justify="center"
      p={{ base: 4, md: 8 }}
    >
      <Box
        textAlign="center"
        p={{ base: 6, md: 10 }}
        bg="white"
        shadow="xl"
        borderRadius="lg"
        maxW="lg"
        width="100%"
      >
        <Heading as="h1" size="xl" color="red.600" mb={4}>
          Unauthorized Access
        </Heading>
        <Text fontSize="md" color="gray.600" mb={6}>
          You are already logged in or don’t have permission to view this page.
        </Text>
        <Button colorScheme="teal" size="md" onClick={() => navigate("/")}>
          Go to Dashboard
        </Button>
      </Box>
    </Flex>
  );
};

export default Unauthorized;
