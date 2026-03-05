import { useContext } from 'react';
import Footer from '../Footer';
import { UserContextType } from '../../types';
import NavBar from '../Navbar';

import { UserContext } from '../../contexts/UserContext';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

const App = () => {
  useContext<UserContextType>(UserContext);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundSize: 'cover',
      }}
    >
      <Container
        component="main"
        sx={{
          flex: '1',
        }}
      >
        <NavBar />
      </Container>

      <Outlet />

      <Footer />
    </Box>
  );
};

export default App;
