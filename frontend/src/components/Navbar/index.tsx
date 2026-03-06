import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

const NavBar = () => {
  const { authenticatedUser, clearUser } =
    useContext<UserContextType>(UserContext);
  const navigate = useNavigate();

  return (
    <AppBar position="static" className="primary-color">
      <Toolbar>
        <Button color="inherit" onClick={() => navigate('/')}>
          Home
        </Button>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {authenticatedUser ? (
            <>
              <Button color="inherit" onClick={() => clearUser()}>
                Se déconnecter
              </Button>
              <Typography variant="h6" component="div">
                Hello {authenticatedUser.email}
              </Typography>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/register')}>
                S'inscrire
              </Button>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
