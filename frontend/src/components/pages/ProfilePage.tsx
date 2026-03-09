import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';

interface Profile {
  id: number;
  email: string;
}

interface Unavailability {
  id: number;
  startDate: string;
  endDate: string;
}

const ProfilePage = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>(
    [],
  );
  const [openUnavailModal, setOpenUnavailModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unavailError, setUnavailError] = useState('');

  useEffect(() => {
    if (!authenticatedUser) return;

    const handleFetchProfile = async () => {
      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser.token,
          },
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data: Profile = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleFetchUnavailabilities = async () => {
      try {
        const response = await fetch('/api/users/me/unavailabilities', {
          headers: { Authorization: authenticatedUser.token },
        });
        if (!response.ok) throw new Error();
        const data: Unavailability[] = await response.json();
        setUnavailabilities(data);
      } catch {}
    };

    handleFetchProfile();
    handleFetchUnavailabilities();
  }, [authenticatedUser]);

  const handlePasswordUpdate = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser!.token,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) throw new Error('Ancien mot de passe incorrect.');
      setPasswordSuccess('Mot de passe modifié avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  const handleAddUnavailability = async () => {
    setUnavailError('');
    if (!startDate || !endDate) {
      setUnavailError('Veuillez remplir les deux dates.');
      return;
    }
    if (endDate < startDate) {
      setUnavailError('La date de fin doit être après la date de début.');
      return;
    }
    try {
      const response = await fetch('/api/users/me/unavailabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser!.token,
        },
        body: JSON.stringify({ startDate, endDate }),
      });
      if (!response.ok) throw new Error("Erreur lors de l'ajout.");
      const data: Unavailability = await response.json();
      setUnavailabilities([...unavailabilities, data]);
      setStartDate('');
      setEndDate('');
      setOpenUnavailModal(false);
    } catch (err: any) {
      setUnavailError(err.message);
    }
  };

  if (!authenticatedUser)
    return <p>Vous devez être connecté pour voir cette page.</p>;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <Box sx={{ margin: 2, padding: 3 }}>
      <h1>Mon Espace personnel</h1>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Mon Profil */}
        <Box
          sx={{
            flex: 1,
            padding: 2,
            border: '1px solid grey',
            borderRadius: 2,
          }}
        >
          <h2>Mon Profil</h2>
          <p>
            <strong>Tag :</strong> —
          </p>
          <p>
            <strong>Spécialité :</strong> —
          </p>
          <p>
            <strong>Team :</strong> —
          </p>
          <p>
            <strong>Date de création :</strong> —
          </p>
          <p>
            <strong>Photo de profil :</strong> —
          </p>
        </Box>

        {/* Mes Infos Privées */}
        <Box
          sx={{
            flex: 1,
            padding: 2,
            border: '1px solid grey',
            borderRadius: 2,
          }}
        >
          <h2>Mes Informations Privées</h2>
          <p>
            <strong>Email :</strong> {profile?.email}
          </p>
          <p>
            <strong>Mot de passe :</strong> ••••••••
            <Button
              size="small"
              variant="outlined"
              sx={{ marginLeft: 2 }}
              onClick={() => setOpenPasswordModal(true)}
            >
              Modifier
            </Button>
          </p>
          <Box>
            <strong>Mes indisponibilités :</strong>
            <Button
              size="small"
              variant="outlined"
              sx={{ marginLeft: 2 }}
              onClick={() => setOpenUnavailModal(true)}
            >
              Ajouter
            </Button>
            {unavailabilities.length === 0 ? (
              <p>Aucune indisponibilité</p>
            ) : (
              <ul>
                {unavailabilities.map((u) => (
                  <li key={u.id}>
                    Du {u.startDate} au {u.endDate}
                  </li>
                ))}
              </ul>
            )}
          </Box>
        </Box>
      </Box>

      {/* Popup password */}
      <Dialog
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      >
        <DialogTitle>Modifier le mot de passe</DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error">{passwordError}</Alert>}
          {passwordSuccess && (
            <Alert severity="success">{passwordSuccess}</Alert>
          )}
          <p></p>
          <TextField
            label="Ancien mot de passe"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirmer"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handlePasswordUpdate}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup unavailability */}
      <Dialog
        open={openUnavailModal}
        onClose={() => setOpenUnavailModal(false)}
      >
        <DialogTitle>Ajouter une indisponibilité</DialogTitle>
        <DialogContent>
          {unavailError && <Alert severity="error">{unavailError}</Alert>}
          <p></p>
          <TextField
            label="Date de début"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Date de fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUnavailModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddUnavailability}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
