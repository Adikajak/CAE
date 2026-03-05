import { useContext } from 'react';
import Footer from '../Footer';
import { UserContextType } from '../../types';
import NavBar from '../Navbar';

import { UserContext } from '../../contexts/UserContext';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';

const App = () => {
  useContext<UserContextType>(UserContext);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <NavBar />

      <Outlet />

      <Footer />
    </Box>
  );
};

export default App;
