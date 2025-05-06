import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

const EditUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        setLoading(false);
      });
  }, []);

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

      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        width="100%"
        maxW="700px"
        color="gray.800"
      >
        <Text fontSize="2xl" fontWeight="bold" color="teal.700" mb="4">
          Edit User Details
        </Text>

        {loading ? (
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box
            maxH="400px"
            overflowY="auto"
            border="1px solid #E2E8F0"
            borderRadius="md"
          >
            <Table variant="simple" size="sm">
              <Thead position="sticky" top={0} bg="gray.100" zIndex={1}>
                <Tr>
                  <Th textAlign="center">ID</Th>
                  <Th textAlign="center">Username</Th>
                  <Th textAlign="center">Email</Th>
                  <Th textAlign="center">Role</Th>
                  <Th textAlign="center">Edit</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.user_id}>
                    <Td textAlign="center">{user.user_id}</Td>
                    <Td textAlign="center">{user.username}</Td>
                    <Td textAlign="center">{user.email}</Td>
                    <Td textAlign="center">{user.role}</Td>
                    <Td textAlign="center">
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => navigate(`/edit-user/${user.user_id}`)}
                      >
                        Edit
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default EditUserList;
