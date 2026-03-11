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
  MenuItem,
} from '@mui/material';
import { UserContextType, Profile, Unavailability } from '../../types';
import { UserContext } from '../../contexts/UserContext';

const specialties = [
  'Archer',
  'Assassin',
  'Mage',
  'Guerrier',
  'Clerc',
  'Paladin',
  'Rodeur',
];

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

  const [openSpecialityModal, setOpenSpecialityModal] = useState(false);
  const [newSpeciality, setNewSpeciality] = useState('');
  const [specialityError, setSpecialityError] = useState('');

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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur inconnue est survenue');
        }
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
      } catch (err: unknown) {
        console.error('Erreur lors du chargement des indisponibilités:', err);
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Une erreur inconnue est survenue');
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUnavailError(err.message);
      } else {
        setUnavailError('Une erreur inconnue est survenue');
      }
    }
  };

  const handleUpdateSpeciality = async () => {
    setSpecialityError('');
    if (!newSpeciality) {
      setSpecialityError('Veuillez choisir une spécialité.');
      return;
    }
    try {
      const response = await fetch('/api/users/me/speciality', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser!.token,
        },
        body: JSON.stringify({ specialityName: newSpeciality }),
      });
      if (!response.ok) throw new Error('Erreur lors de la modification.');
      setProfile(profile ? { ...profile, speciality: newSpeciality } : null);
      setOpenSpecialityModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSpecialityError(err.message);
      }
    }
  };

  if (!authenticatedUser)
    return <p>Vous devez être connecté pour voir cette page.</p>;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <Box sx={{ margin: 2, padding: 3, textAlign: 'center' }}>
      <h1>Mon Espace personnel</h1>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {/* Mon Profil */}
        <Box
          sx={{
            width: 350,
            padding: 2,
            border: '1px solid grey',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <h2>Mon Profil</h2>
          <p>
            <strong>Tag :</strong> {profile?.tag}
          </p>
          <p>
            <strong>Spécialité :</strong> {profile?.speciality}
            <Button
              size="small"
              variant="outlined"
              sx={{ marginLeft: 2 }}
              onClick={() => setOpenSpecialityModal(true)}
            >
              Modifier
            </Button>
          </p>
          <p>
            <strong>Team :</strong> - {/* À implémenter côté backend */}
          </p>
          <p>
            <strong>Date de création :</strong>{' '}
            {profile?.date ? profile.date.split('-').reverse().join('/') : '—'}
          </p>
          <p>
            <strong>Photo de profil :</strong>{' '}
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt="Profil"
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
            ) : (
              'Aucune photo'
            )}
          </p>
        </Box>

        {/* Mes Infos Privées */}
        <Box
          sx={{
            width: 350,
            padding: 2,
            border: '1px solid grey',
            borderRadius: 2,
            textAlign: 'center',
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
                    {u.startDate.split('-').reverse().join('/')} -{' '}
                    {u.endDate.split('-').reverse().join('/')}
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

      {/* Popup spécialité */}
      <Dialog
        open={openSpecialityModal}
        onClose={() => setOpenSpecialityModal(false)}
      >
        <DialogTitle>Modifier la spécialité</DialogTitle>
        <DialogContent>
          {specialityError && <Alert severity="error">{specialityError}</Alert>}
          <p></p>
          <TextField
            fullWidth
            select
            label="Spécialité"
            value={newSpeciality}
            onChange={(e) => setNewSpeciality(e.target.value)}
          >
            {specialties.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSpecialityModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpdateSpeciality}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
