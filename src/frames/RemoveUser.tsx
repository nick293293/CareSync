import React, { useEffect, useState, useRef } from "react";
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
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

const RemoveUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const cancelRef = useRef(null);

  const fetchUsers = () => {
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
  };

  const openDeleteDialog = (userId: number) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedUserId === null) return;

    axios
      .delete(`http://localhost:5000/api/delete-user/${selectedUserId}`)
      .then(() => {
        toast({
          title: "User Removed",
          description: `User ID ${selectedUserId} has been deleted.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setUsers(users.filter((user) => user.user_id !== selectedUserId));
      })
      .catch((error) => {
        toast({
          title: "Error",
          description:
            error.response?.status === 403
              ? "Cannot delete admin account."
              : "Failed to delete user.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsDialogOpen(false);
        setSelectedUserId(null);
      });
  };

  useEffect(() => {
    fetchUsers();
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
          Remove User
        </Text>

        {loading ? (
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box
            maxH="400px"
            overflowY="auto"
            overflowX="auto"
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
                  <Th textAlign="center">Action</Th>
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
                      {user.role.toLowerCase() !== "admin" && (
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => openDeleteDialog(user.user_id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Confirm Delete Dialog */}
        <AlertDialog
          isOpen={isDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete User
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Flex>
  );
};

export default RemoveUser;
