import {
  useContext,
  useEffect,
  useState,
  SyntheticEvent,
  useCallback,
} from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { UserContextType, UserProfile } from '../../types';
import { UserContext } from '../../contexts/UserContext';

const AdministrationPage = () => {
  const { authenticatedUser, jwtData } =
    useContext<UserContextType>(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [administrationList, setAdministrationList] = useState<
    UserProfile[] | null
  >(null);

  const [openPromoteModal, setOpenPromoteModal] = useState(false);
  const [nonAdmins, setNonAdmins] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [promoteError, setPromoteError] = useState('');
  const [demoteError, setDemoteError] = useState('');
  const currentUserId = jwtData()?.id;

  const handleFetchAdministrators = useCallback(async () => {
    if (!authenticatedUser) return;
    try {
      const response = await fetch('/api/administrators/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data: UserProfile[] | null = await response.json();
      setAdministrationList(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  }, [authenticatedUser]);

  useEffect(() => {
    handleFetchAdministrators();
  }, [handleFetchAdministrators]);

  const handleOpenPromoteModal = async () => {
    if (!authenticatedUser) return;
    try {
      const response = await fetch('/api/administrators/non-admins', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data: UserProfile[] = await response.json();
      setNonAdmins(data);
      setOpenPromoteModal(true);
      setPromoteError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPromoteError(err.message);
      } else {
        setPromoteError('Une erreur inconnue est survenue');
      }
    }
  };

  const handleClosePromoteModal = () => {
    setOpenPromoteModal(false);
    setSelectedUserId('');
    setPromoteError('');
  };

  const handleUserSelectChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setSelectedUserId(Number(input.value));
  };

  const handlePromote = async () => {
    if (!authenticatedUser || selectedUserId === '') return;
    try {
      const response = await fetch(`/api/administrators/${selectedUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      handleClosePromoteModal();
      await handleFetchAdministrators();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPromoteError(err.message);
      } else {
        setPromoteError('Une erreur inconnue est survenue');
      }
    }
  };

  const handleDemote = async (userId: number) => {
    if (!authenticatedUser) return;
    try {
      const response = await fetch(`/api/administrators/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Vous ne pouvez pas vous rétrograder vous-même');
        }
        throw new Error(`Erreur ${response.status}`);
      }
      setDemoteError('');
      await handleFetchAdministrators();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDemoteError(err.message);
      } else {
        setDemoteError('Une erreur inconnue est survenue');
      }
    }
  };

  if (!authenticatedUser || !jwtData()?.isAdmin)
    return <p>Vous devez être administrateur pour voir cette page.</p>;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <Box sx={{ margin: 2, padding: 3, textAlign: 'center' }}>
      <h1>Administration</h1>
      <Box sx={{ marginBottom: 2 }}>
        <Button variant="contained" onClick={handleOpenPromoteModal}>
          Nommer un nouvel administrateur
        </Button>
      </Box>
      {administrationList && administrationList.length === 0 ? (
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          <p>Aucun administrateur actuellement.</p>
        </Box>
      ) : (
        <>
          {demoteError && <Alert severity="error">{demoteError}</Alert>}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>email</TableCell>
                <TableCell>tag</TableCell>
                <TableCell>spécialité</TableCell>
                <TableCell>date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {administrationList?.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.tag}</TableCell>
                  <TableCell>{admin.speciality}</TableCell>
                  <TableCell>{admin.date}</TableCell>
                  <TableCell>
                    {admin.id !== currentUserId && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDemote(admin.id)}
                      >
                        Rétrograder
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Dialog open={openPromoteModal} onClose={handleClosePromoteModal}>
        <DialogTitle>Nommer un administrateur</DialogTitle>
        <DialogContent>
          {promoteError && <Alert severity="error">{promoteError}</Alert>}
          {nonAdmins.length === 0 ? (
            <Box sx={{ padding: 2, textAlign: 'center' }}>
              <p>Aucun utilisateur non-administrateur disponible.</p>
            </Box>
          ) : (
            <TextField
              select
              label="Utilisateur"
              value={selectedUserId}
              onChange={handleUserSelectChange}
              fullWidth
              margin="normal"
            >
              {nonAdmins.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.email} ({user.tag})
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePromoteModal}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handlePromote}
            disabled={selectedUserId === '' || nonAdmins.length === 0}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdministrationPage;
