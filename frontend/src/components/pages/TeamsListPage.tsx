import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType, Team } from '../../types';

const TeamsListPage = () => {
  const { authenticatedUser, setAuthenticatedUser } =
    useContext<UserContextType>(UserContext);

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  // Récupération des teams depuis l'API
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = authenticatedUser.token;
        }

        const res = await fetch('/api/teams', { headers });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: Team[] = await res.json();
        setTeams(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [authenticatedUser?.token, authenticatedUser?.teamId]); // 🔑 dépendances importantes

  // Création d'une nouvelle team
  const handleCreateTeam = async () => {
    if (!authenticatedUser || !newTeamName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
        body: JSON.stringify({ name: newTeamName }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const createdTeam: Team = await res.json();

      // Mettre à jour l'utilisateur avec la nouvelle team
      if (setAuthenticatedUser) {
        setAuthenticatedUser({ ...authenticatedUser, teamId: createdTeam.id });
      }

      // Ajouter la team dans la liste
      setTeams((prev) => [createdTeam, ...prev]);
      setNewTeamName('');

      // Navigation après mise à jour de l'état
      setTimeout(() => {
        navigate(`/teams/${createdTeam.id}`);
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error)
        alert(`Impossible de créer la team: ${err.message}`);
      else alert('Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // Séparer la team de l'utilisateur du reste
  const userTeam = authenticatedUser
    ? teams.find((t) => t.id === authenticatedUser.teamId)
    : null;
  const otherTeams = userTeam
    ? teams.filter((t) => t.id !== userTeam.id)
    : teams;

  return (
    <Box sx={{ margin: 2, padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Liste des Teams
      </Typography>

      {/* Formulaire création team uniquement si connecté et sans team */}
      {authenticatedUser && !authenticatedUser.teamId && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="Nom de la team"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleCreateTeam}
            disabled={creating}
          >
            Créer une team
          </Button>
        </Box>
      )}

      <Stack spacing={2}>
        {/* Team de l'utilisateur */}
        {userTeam && (
          <Card
            sx={{ padding: 2, backgroundColor: '#cce0ff', cursor: 'pointer' }}
            onClick={() => navigate(`/teams/${userTeam.id}`)}
          >
            <CardContent>
              <Typography variant="h6">Ma team</Typography>
              <Typography variant="subtitle1">{userTeam.name}</Typography>
              <Typography variant="body2">
                Manager : {userTeam.manager?.email ?? '—'}
              </Typography>
              <Typography variant="body2">
                Second manager : {userTeam.secondManager?.email ?? '—'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Autres teams */}
        {otherTeams.length === 0 && !userTeam ? (
          <Typography>Aucune team disponible</Typography>
        ) : (
          otherTeams.map((team) => (
            <Card
              key={team.id}
              sx={{
                padding: 2,
                cursor: authenticatedUser ? 'pointer' : 'default',
              }}
              onClick={() => authenticatedUser && navigate(`/teams/${team.id}`)}
            >
              <CardContent>
                <Typography variant="h6">{team.name}</Typography>
                <Typography variant="body2">
                  Responsable : {team.manager?.email ?? ''}
                </Typography>
                <Typography variant="body2">
                  Second Responsable : {team.secondManager?.email ?? ''}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default TeamsListPage;
