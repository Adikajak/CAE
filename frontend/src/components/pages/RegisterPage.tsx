import { ChangeEvent, SyntheticEvent, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';

const specialties = [
  'Archer',
  'Assassin',
  'Mage',
  'Guerrier',
  'Clerc',
  'Paladin',
  'Rodeur',
];

const avatarOptions = [
  {
    id: 'knight',
    label: 'Chevalier',
    src: 'https://robohash.org/knight?set=set2',
  },
  {
    id: 'wizard',
    label: 'Mage',
    src: 'https://robohash.org/wizard?set=set2',
  },
  {
    id: 'archer',
    label: 'Archer',
    src: 'https://robohash.org/archer?set=set2',
  },
  {
    id: 'orc',
    label: 'Orc',
    src: 'https://robohash.org/orc?set=set2',
  },
  {
    id: 'elf',
    label: 'Elfe',
    src: 'https://robohash.org/elf?set=set2',
  },
  {
    id: 'druid',
    label: 'Druide',
    src: 'https://robohash.org/druid?set=set2',
  },
];

const getRegisterErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    if (err.message.includes('400')) {
      return "Echec d'inscription. Verifiez les champs et la specialite choisie.";
    }

    if (err.message.includes('409')) {
      return 'Cette adresse email existe deja. Veuillez en utiliser une autre.';
    }
  }

  return "Echec d'inscription. Veuillez reessayer.";
};

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tag, setTag] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatarOptions[0].id);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!specialty) {
      setErrorMessage('Veuillez choisir une specialite.');
      return;
    }

    try {
      const selectedAvatar = avatarOptions.find(
        (avatar) => avatar.id === selectedAvatarId,
      );

      await registerUser({
        email,
        password,
        tag,
        speciality: specialty,
        profile_picture: selectedAvatar?.src ?? '',
      });
      setSuccessMessage(
        'Compte cree avec succes. Redirection vers la connexion...',
      );
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error('RegisterPage::error: ', err);
      setErrorMessage(getRegisterErrorMessage(err));
    }
  };

  const handleEmailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Box
      sx={{
        margin: { xs: 2, md: 4 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          padding: 3,
          borderRadius: 4,
          boxShadow: 4,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          S'inscrire
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              type="email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={handleEmailInputChange}
              required
              color="primary"
              sx={{
                input: { color: theme.palette.primary.main },
              }}
            />
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="tag"
              name="tag"
              label="tag"
              variant="outlined"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              required
              color="primary"
              sx={{
                input: { color: theme.palette.primary.main },
              }}
            />
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="password"
              name="password"
              type={isPasswordVisible ? 'text' : 'password'}
              label="Mot de passe"
              variant="outlined"
              value={password}
              onChange={handlePasswordChange}
              required
              color="primary"
              sx={{
                input: { color: theme.palette.primary.main },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          isPasswordVisible
                            ? 'Masquer le mot de passe'
                            : 'Afficher le mot de passe'
                        }
                        onClick={() => setIsPasswordVisible((prev) => !prev)}
                        edge="end"
                      >
                        {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="specialty"
              name="specialty"
              select
              label="Specialite"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            >
              {specialties.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Choisir une photo de profil
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ overflowX: 'auto', pb: 1 }}
            >
              {avatarOptions.map((avatar) => (
                <IconButton
                  key={avatar.id}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  aria-label={`Choisir l'avatar ${avatar.label}`}
                  sx={{
                    border:
                      selectedAvatarId === avatar.id
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    src={avatar.src}
                    alt={avatar.label}
                    sx={{ width: 46, height: 46 }}
                  />
                </IconButton>
              ))}
            </Stack>
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Creer le compte
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Vous avez deja un compte ? <Link to="/login">Connectez-vous</Link>
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ marginTop: 2 }}>
              {successMessage}
            </Alert>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default RegisterPage;
