import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import logoCae from '../../assets/images/logo_cae.png';

import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

const NavBar = () => {
  const { authenticatedUser, clearUser, jwtData } =
    useContext<UserContextType>(UserContext);
  const navigate = useNavigate();
  const isAdmin = jwtData()?.isAdmin ?? false;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const openProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setMenuAnchor(null);
  };

  const navButtonSx = {
    color: '#F6F7FF',
    fontWeight: 700,
    letterSpacing: 0.2,
    textTransform: 'none',
    borderRadius: 1.5,
    px: 1.5,
    py: 0.4,
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        background:
          'linear-gradient(180deg, rgba(12,18,52,0.98) 0%, rgba(10,14,40,0.98) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 1, md: 2 }, gap: 1 }}>
        <Button
          onClick={() => navigate('/')}
          sx={{
            minWidth: 'auto',
            p: 0,
            borderRadius: 1,
            mr: 0.5,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
          aria-label="Accueil Vinci Arena"
        >
          <Box
            component="img"
            src={logoCae}
            alt="Logo CAE"
            sx={{
              height: { xs: 42, md: 48 },
              width: 'auto',
              display: 'block',
            }}
          />
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button sx={navButtonSx} onClick={() => navigate('/')}>
            Accueil
          </Button>
          <Button sx={navButtonSx} onClick={() => navigate('/')}>
            Tournois
          </Button>
          <Button sx={navButtonSx} onClick={() => navigate('/')}>
            Membres
          </Button>
          <Button sx={navButtonSx} onClick={() => navigate('/teams')}>
            Teams
          </Button>
          {isAdmin ? (
            <Button color="inherit" onClick={() => navigate('/administration')}>
              Administration
            </Button>
          ) : (
            <></>
          )}
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          {authenticatedUser ? (
            <>
              <IconButton
                onClick={() => navigate('/notifications')}
                sx={{
                  color: '#F6F7FF',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
                }}
              >
                <Badge
                  color="error"
                  overlap="circular"
                  variant="dot"
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Button
                onClick={openProfileMenu}
                sx={{
                  color: '#F6F7FF',
                  textTransform: 'none',
                  borderRadius: 999,
                  px: 0.6,
                  py: 0.4,
                  gap: 0.8,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, maxWidth: 140 }}
                  noWrap
                >
                  {authenticatedUser.email}
                </Typography>
                <Avatar sx={{ width: 30, height: 30, bgcolor: '#7DBB6D' }}>
                  {authenticatedUser.email.slice(0, 1).toUpperCase()}
                </Avatar>
              </Button>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeProfileMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    closeProfileMenu();
                    navigate('/profile');
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Espace personnel</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    closeProfileMenu();
                    clearUser();
                    navigate('/');
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText sx={{ color: 'error.main' }}>
                    Deconnexion
                  </ListItemText>
                </MenuItem>
              </Menu>

              {isAdmin && (
                <Typography
                  variant="caption"
                  sx={{ color: '#FFD96A', fontWeight: 700, ml: 0.5 }}
                >
                  ADMIN
                </Typography>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#F2F3FA',
                  color: '#1A204A',
                  textTransform: 'none',
                  borderRadius: 1,
                  fontWeight: 700,
                  px: 1.4,
                  py: 0.4,
                  '&:hover': { backgroundColor: '#FFFFFF' },
                }}
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#3157C6',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  borderRadius: 1,
                  fontWeight: 700,
                  px: 1.4,
                  py: 0.4,
                  '&:hover': { backgroundColor: '#294CB4' },
                }}
              >
                S'inscrire
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
