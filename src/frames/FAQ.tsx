import React from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const FAQ: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Flex
      color="gray.700"
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

      <Box bg="white" p={8} borderRadius="lg" width="80%" maxW="600px">
        <Text fontSize="2xl" fontWeight="bold" color="teal.700" mb="4">
          Frequently Asked Questions (FAQ)
        </Text>

        <Accordion allowMultiple>
          {/* Doctors Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  Doctors
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text fontWeight="bold">
                1. How can I access my patient records?
              </Text>
              <Text>
                Doctors can access patient records via the "Look Up Patient"
                section.
              </Text>

              <Text mt={3} fontWeight="bold">
                2. How do I update a patient’s medical history?
              </Text>
              <Text>
                Navigate to the patient profile and select "Manage Patient
                Info".
              </Text>
            </AccordionPanel>
          </AccordionItem>

          {/* Admin Section */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  Admin
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text fontWeight="bold">
                1. How can I create new user accounts?
              </Text>
              <Text>
                Admins can add users under the "User Management" section.
              </Text>

              <Text mt={3} fontWeight="bold">
                2. How do I reset passwords for staff members?
              </Text>
              <Text>
                Go to "User Management" {">"} Select User {">"} Click "Reset
                Password".
              </Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Flex>
  );
};

export default FAQ;
