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
        height: '100vh',
      }}
    >
      <NavBar />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
};

export default App;
