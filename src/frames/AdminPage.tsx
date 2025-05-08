import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminPage = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("gray.100", "gray.700");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/adminLogin"); // Goes to the admin login page
  };

  return (
    <Flex
      align="center"
      justify="center"
      bg="teal.600"
      minHeight="100vh"
      width="100vw"
      overflow="hidden"
      px={4}
    >
      <Box
        bg="white"
        p={{ base: 6, md: 10 }}
        borderRadius="lg"
        shadow="xl"
        width="100%"
        maxWidth="1000px"
        position="relative"
      >
        {/* Logout Button */}
        <Box position="absolute" top={4} right={4}>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        <Heading as="h1" size="xl" textAlign="center" color="teal.700" mb={2}>
          Admin Dashboard
        </Heading>
        <Text textAlign="center" fontSize="md" color="gray.600" mb={8}>
          Manage users and system tasks below.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Add Users */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            textAlign="center"
            shadow="md"
          >
            <Icon as={AddIcon} w={6} h={6} color="teal.500" mb={2} />
            <Heading as="h3" size="md" mb={2}>
              Add Users
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Create new user accounts with roles and permissions.
            </Text>
            <Button
              colorScheme="teal"
              size="sm"
              onClick={() => navigate("/add-user")}
            >
              Add
            </Button>
          </Box>

          {/* Remove Users */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            textAlign="center"
            shadow="md"
          >
            <Icon as={DeleteIcon} w={6} h={6} color="teal.500" mb={2} />
            <Heading as="h3" size="md" mb={2}>
              Remove Users
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              View and delete existing users from the system.
            </Text>
            <Button
              colorScheme="teal"
              size="sm"
              onClick={() => navigate("/remove-user")}
            >
              Remove
            </Button>
          </Box>

          {/* Edit Users */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            textAlign="center"
            shadow="md"
          >
            <Icon as={EditIcon} w={6} h={6} color="teal.500" mb={2} />
            <Heading as="h3" size="md" mb={2}>
              Edit Users
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Update user details such as email, role, or phone.
            </Text>
            <Button
              colorScheme="teal"
              size="sm"
              onClick={() => navigate("/edit-user-list")}
            >
              Edit
            </Button>
          </Box>
        </SimpleGrid>
      </Box>
    </Flex>
  );
};

export default AdminPage;
