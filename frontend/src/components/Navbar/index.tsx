import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { UserContext } from '../../contexts/UserContext';
import { UserContextType, Notification } from '../../types';

const NavBar = () => {
  const { authenticatedUser, clearUser, jwtData } =
    useContext<UserContextType>(UserContext);
  const navigate = useNavigate();
  const isAdmin = jwtData()?.admin ?? false;

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!authenticatedUser) return;
    fetch('/api/notifications/', {
      headers: { Authorization: authenticatedUser.token },
    })
      .then((res) => res.json())
      .then((data: Notification[]) => {
        console.log('notifications data:', data);
        setHasUnread(data.some((n) => !n.isRead));
      })
      .catch(() => {});
  }, [authenticatedUser]);

  return (
    <AppBar position="static" className="primary-color">
      <Toolbar>
        <Button color="inherit" onClick={() => navigate('/')}>
          Home
        </Button>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAdmin ? <Typography variant="h6">Hi Admin</Typography> : <></>}
          {authenticatedUser ? (
            <>
              <IconButton
                color="inherit"
                onClick={() => navigate('/notifications')}
              >
                <Badge variant="dot" color="error" invisible={!hasUnread}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
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
