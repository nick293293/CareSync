import React from "react";
import { Box, Heading, Text, Button, Flex, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  //handles logout
  const handleLogout = () => {
    navigate("/adminLogin"); // Goes to the admin login page
  };

  return (
    <Flex
      align="center"
      justify="center"
      bg="gray.50"
      minHeight="100vh"
      width="100vw"
      overflow="hidden"
    >
      <Box
        bg="white"
        p={{ base: 6, md: 12 }}
        borderRadius="md"
        shadow="lg"
        width="100%"
        maxWidth="800px"
        mx="auto"
        position="relative"
      >
        {/* Top-Right Buttons */}
        <Box position="absolute" top={4} right={4} display="flex" gap={4}>
          <Button
            colorScheme="teal"
            size="sm"
            onClick={() => alert("View Notifications")}
          >
            Notifications
          </Button>
          <Button
            colorScheme="teal"
            size="sm"
            onClick={() => alert("Open Settings")}
          >
            Settings
          </Button>
          <Button
            colorScheme="red"
            size="sm"
            onClick={handleLogout} // logout function
          >
            Logout
          </Button>
        </Box>

        {/* Admin Staff Home Heading */}
        <Heading as="h1" size="xl" mb={4} textAlign="center" color="gray.700">
          Admin Home
        </Heading>

        {/* Welcome Message */}
        <Text textAlign="center" mb={6} color="gray.600" fontSize="lg">
          Welcome, Administrator! Here's an overview of your tasks.
        </Text>

        <Stack spacing={6}>
          {/* Add Users */}
          <Box
            bg="gray.100"
            p={6}
            borderRadius="md"
            shadow="sm"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color="gray.700">
              New Users
            </Heading>
            <Text color="gray.600">Add Users.</Text>
            <Button
              mt={4}
              colorScheme="teal"
              size="sm"
              onClick={() => alert("Add user In PROGRESS")}
            >
              Manage
            </Button>
          </Box>

          {/* Remove user */}
          <Box
            bg="gray.100"
            p={6}
            borderRadius="md"
            shadow="sm"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Remove Users
            </Heading>
            <Text color="gray.600">See list of Users.</Text>
            <Button
              mt={4}
              colorScheme="teal"
              size="sm"
              onClick={() => alert("Remove In PROGRESS")}
            >
              Remove
            </Button>
          </Box>

          {/* Update User */}
          <Box
            bg="gray.100"
            p={6}
            borderRadius="md"
            shadow="sm"
            textAlign="center"
          >
            <Heading as="h3" size="md" mb={2} color="gray.700">
              Edit User Account Details
            </Heading>
            <Text color="gray.600">Make changes to User account.</Text>
            <Button
              mt={4}
              colorScheme="teal"
              size="sm"
              onClick={() => alert("Edit In PROGRESS")}
            >
              Edit
            </Button>
          </Box>
        </Stack>
      </Box>
    </Flex>
  );
};

export default AdminPage;
