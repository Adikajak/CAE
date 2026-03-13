import {
  ChangeEvent,
  SyntheticEvent,
  useContext,
  useEffect,
  useState,
} from 'react';
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

interface AvatarOption {
  id: string;
  label: string;
  src: string;
}

const AVATAR_URLS_CACHE_KEY = 'register_avatar_urls';

const mapUrlsToAvatarOptions = (urls: string[]): AvatarOption[] =>
  urls.map((url, index) => ({
    id: `avatar-${index + 1}`,
    label: `Avatar ${index + 1}`,
    src: url,
  }));

const preloadImages = (urls: string[]) => {
  urls.forEach((url) => {
    const image = new Image();
    image.src = url;
  });
};

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
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const hydrateFromCache = () => {
      try {
        const cached = localStorage.getItem(AVATAR_URLS_CACHE_KEY);
        if (cached == null) {
          return;
        }

        const cachedUrls = JSON.parse(cached) as string[];
        if (cachedUrls.length === 0) {
          return;
        }

        const cachedOptions = mapUrlsToAvatarOptions(cachedUrls);
        setAvatarOptions(cachedOptions);
        setSelectedAvatarId(cachedOptions[0].id);
      } catch (err) {
        console.error('RegisterPage::hydrateFromCache::error: ', err);
      }
    };

    const loadProfilePictures = async () => {
      try {
        const response = await fetch('/api/profile-pictures');
        if (!response.ok) {
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`,
          );
        }

        const urls: string[] = await response.json();
        const options = mapUrlsToAvatarOptions(urls);

        setAvatarOptions(options);
        if (options.length > 0) {
          setSelectedAvatarId(options[0].id);
          localStorage.setItem(AVATAR_URLS_CACHE_KEY, JSON.stringify(urls));
          preloadImages(urls);
        } else {
          setErrorMessage('Aucune photo de profil configuree en base.');
        }
      } catch (err) {
        console.error('RegisterPage::loadProfilePictures::error: ', err);
        setErrorMessage('Impossible de charger les photos de profil.');
      }
    };

    const loadSpecialties = async () => {
      try {
        const response = await fetch('/api/specialities');
        if (!response.ok) {
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`,
          );
        }

        const specialtiesList: string[] = await response.json();
        setSpecialties(specialtiesList);
      } catch (err) {
        console.error('RegisterPage::loadSpecialties::error: ', err);
        setErrorMessage('Impossible de charger les specialites.');
      }
    };

    hydrateFromCache();
    void loadProfilePictures();
    void loadSpecialties();
  }, []);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!specialty) {
      setErrorMessage('Veuillez choisir une specialite.');
      return;
    }

    if (!selectedAvatarId) {
      setErrorMessage('Aucune photo de profil disponible.');
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
          padding: 3,
          borderRadius: 4,
          boxShadow: 4,
          textAlign: 'center',
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
                textAlign: 'center',
              }}
            />
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="tag"
              name="tag"
              label="Tag"
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
                    imgProps={{ loading: 'eager' }}
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
            Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
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
