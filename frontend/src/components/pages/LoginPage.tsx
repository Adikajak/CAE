import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, TextField, useTheme } from '@mui/material';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';

const LoginPage = () => {
  const { loginUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await loginUser({ email, password });
      navigate('/');
    } catch (err) {
      console.error('LoginPage::error: ', err);
      setErrorMessage(
        "Echec de connexion. Verifiez l'email et le mot de passe.",
      );
    }
  };

  const handleEmailInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setEmail(input.value);
  };

  const handlePasswordChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setPassword(input.value);
  };

  return (
    <Box
      sx={{
        margin: 2,
        padding: 3,
        backgroundColor: 'secondary.light',
        borderRadius: 4,
        boxShadow: 2,
      }}
    >
      <h1>Connectez un utilisateur</h1>
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
              input: { color: theme.palette.secondary.contrastText },
            }}
          />
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            required
            color="primary"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
            }}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          S'authentifier
        </Button>
        {errorMessage && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </form>
    </Box>
  );
};

export default LoginPage;
