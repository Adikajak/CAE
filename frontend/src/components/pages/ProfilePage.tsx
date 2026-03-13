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
  Stack,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  UserContextType,
  Profile,
  Unavailability,
  AvatarOption,
} from '../../types';
import { UserContext } from '../../contexts/UserContext';

const ProfilePage = () => {
  const { authenticatedUser, jwtData } =
    useContext<UserContextType>(UserContext);

  // Profile data loaded from the API
  const [profile, setProfile] = useState<Profile | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password change modal state
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Unavailability modal state
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>(
    [],
  );
  const [openUnavailModal, setOpenUnavailModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unavailError, setUnavailError] = useState('');

  // Speciality change modal state
  const [openSpecialityModal, setOpenSpecialityModal] = useState(false);
  const [newSpeciality, setNewSpeciality] = useState('');
  const [specialityError, setSpecialityError] = useState('');

  // Profile picture change modal state
  const [openPictureModal, setOpenPictureModal] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
  const [selectedAvatarSrc, setSelectedAvatarSrc] = useState('');
  const [pictureError, setPictureError] = useState('');

  // Load all required data on component mount
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

    const handleFetchSpecialties = async () => {
      try {
        const response = await fetch('/api/specialities');
        if (!response.ok) throw new Error();
        const data: string[] = await response.json();
        setSpecialties(data);
      } catch (err) {
        console.error('Erreur lors du chargement des spécialités:', err);
      }
    };

    const handleFetchAvatars = async () => {
      try {
        const response = await fetch('/api/profile-pictures');
        if (!response.ok) throw new Error();
        const urls: string[] = await response.json();
        const options = urls.map((url, index) => ({
          id: `avatar-${index + 1}`,
          src: url,
          label: `Avatar ${index + 1}`,
        }));
        setAvatarOptions(options);
      } catch (err) {
        console.error('Erreur lors du chargement des avatars:', err);
      }
    };

    handleFetchProfile();
    handleFetchUnavailabilities();
    handleFetchSpecialties();
    handleFetchAvatars();
  }, [authenticatedUser]);

  // Validates that new passwords match before sending the request
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

  // Validates that end date is after start date before sending the request
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

  // Validates that a speciality is selected before sending the request
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

  // Validates that an avatar is selected before sending the request
  const handleUpdatePicture = async () => {
    setPictureError('');
    if (!selectedAvatarSrc) {
      setPictureError('Veuillez choisir une photo.');
      return;
    }
    try {
      const response = await fetch('/api/users/me/profile-picture', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser!.token,
        },
        body: JSON.stringify({ profilePictureUrl: selectedAvatarSrc }),
      });
      if (!response.ok) throw new Error('Erreur lors de la modification.');
      setProfile(
        profile ? { ...profile, profilePicture: selectedAvatarSrc } : null,
      );
      setOpenPictureModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) setPictureError(err.message);
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
        {/* Public profile information */}
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
            <strong>Team :</strong> {profile?.teamName || 'Aucune team'}
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
                style={{ width: 80, height: 80, objectFit: 'cover' }}
              />
            ) : (
              'Aucune photo'
            )}
            <p> </p>
            <Button
              size="small"
              variant="outlined"
              sx={{ marginLeft: 2 }}
              onClick={() => setOpenPictureModal(true)}
            >
              Modifier
            </Button>
          </p>
        </Box>

        {/* Private information */}
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
            <strong>Responsable d'une team :</strong>{' '}
            {profile?.isManager ? 'Oui' : 'Non'}
          </p>
          <p>
            <strong>Administrateur :</strong>{' '}
            {jwtData()?.isAdmin ? 'Oui' : 'Non'}
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

      {/* Password popup */}
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

      {/* Unavailability popup */}
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

      {/* Speciality popup */}
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

      {/* Profile picture popup */}
      <Dialog
        open={openPictureModal}
        onClose={() => setOpenPictureModal(false)}
      >
        <DialogTitle>Modifier la photo de profil</DialogTitle>
        <DialogContent>
          {pictureError && <Alert severity="error">{pictureError}</Alert>}
          <p></p>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
            {avatarOptions.map((avatar) => (
              <IconButton
                key={avatar.id}
                onClick={() => setSelectedAvatarSrc(avatar.src)}
                sx={{
                  border:
                    selectedAvatarSrc === avatar.src
                      ? '2px solid blue'
                      : '1px solid grey',
                  borderRadius: 2,
                }}
              >
                <Avatar src={avatar.src} sx={{ width: 46, height: 46 }} />
              </IconButton>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPictureModal(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpdatePicture}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
