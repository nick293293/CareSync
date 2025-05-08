import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import PatientLookup from "./components/PatientLookup.tsx";

function App() {
  return (
    <ChakraProvider>
      <PatientLookup />  {/* This should render the Look Up Patient button */}
    </ChakraProvider>
  );
}

export default App;
