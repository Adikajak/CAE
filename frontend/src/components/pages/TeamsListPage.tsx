import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Container,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { TeamMembership, UserContextType, Team } from '../../types';

const TeamsListPage = () => {
  const { authenticatedUser, setAuthenticatedUser } =
    useContext<UserContextType>(UserContext);

  const [teams, setTeams] = useState<Team[]>([]);
  const [currentMembership, setCurrentMembership] =
    useState<TeamMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [acceptManagerRole, setAcceptManagerRole] = useState(false);

  const [joinError, setJoinError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      if (!authenticatedUser?.token) {
        setCurrentMembership(null);
      }
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = authenticatedUser.token;
        }

        const membershipRequest = authenticatedUser?.token
          ? fetch('/api/teams/memberships/me', { headers })
          : Promise.resolve(null);

        const [res, membershipResponse] = await Promise.all([
          fetch('/api/teams', { headers }),
          membershipRequest,
        ]);

        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        if (membershipResponse?.status === 204) {
          setCurrentMembership(null);
        } else if (membershipResponse && membershipResponse.ok) {
          const membershipData: TeamMembership =
            await membershipResponse.json();
          setCurrentMembership(membershipData);
        } else if (membershipResponse && !membershipResponse.ok) {
          throw new Error(`Erreur ${membershipResponse.status}`);
        }

        const teamsData: Team[] = await res.json();
        setTeams(teamsData);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [authenticatedUser?.token]);

  const handleCreateTeam = async () => {
    if (!authenticatedUser || !newTeamName.trim() || !acceptManagerRole) return;

    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!res.ok) {
        let errorMsg = ``;

        if (res.status === 403) {
          errorMsg =
            'Impossible de créer une nouvelle team (une ou plusieurs raisons) :\n' +
            "• Vous faites déjà d'une team\n" +
            '• Le nom de la team que vous voulez créer existe déjà';
        }

        throw new Error(errorMsg);
      }

      const createdTeam: Team = await res.json();
      if (setAuthenticatedUser) {
        setAuthenticatedUser({ ...authenticatedUser, teamId: createdTeam.id });
      }
      setCurrentMembership(null);
      setTeams((prev) => [...prev, createdTeam]);
      setNewTeamName('');
      setAcceptManagerRole(false);
    } catch (err: unknown) {
      if (err instanceof Error) setCreateError(err.message);
      else setCreateError('Impossible de créer la team');
    } finally {
      setCreating(false);
    }
  };

  // const getTeamMemberCount = (team: Team) => {
  //   let count = 0;
  //   if (team.manager) {
  //     count += 1;
  //     if (team.secondManager) count += 1;
  //   }
  //   return count;
  // };

  const currentTeamId =
    authenticatedUser?.teamId ??
    (currentMembership?.status === 'ACCEPTED'
      ? currentMembership.team.id
      : undefined);

  const sortedTeams = teams.slice().sort((a, b) => {
    const isAUserTeam = a.id === currentTeamId;
    const isBUserTeam = b.id === currentTeamId;
    if (isAUserTeam && !isBUserTeam) return -1;
    if (!isAUserTeam && isBUserTeam) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box
        sx={{
          padding: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', mt: 2 }}>
          Liste des Teams
        </Typography>

        {authenticatedUser && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              maxWidth: 500,
            }}
          >
            <TextField
              fullWidth
              label="Nom de la team"
              value={newTeamName}
              onChange={(e) => {
                setNewTeamName(e.target.value);
                setCreateError(null);
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={acceptManagerRole}
                  onChange={(e) => setAcceptManagerRole(e.target.checked)}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textAlign: 'left',
                  }}
                >
                  En créant une team, vous acceptez d'être automatiquement
                  désigné comme responsable et de participer activement à sa
                  gestion.
                </Typography>
              }
              sx={{ alignSelf: 'flex-start', mt: 1 }}
            />

            <Button
              variant="contained"
              onClick={handleCreateTeam}
              disabled={creating || !acceptManagerRole}
              sx={{
                mt: 1,
                width: '50%',
                alignSelf: 'center',
                backgroundColor: 'primary.light',
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              {creating ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Créer une team'
              )}
            </Button>
          </Box>
        )}

        {createError && authenticatedUser && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Alert
              severity="error"
              sx={{ whiteSpace: 'pre-line' }}
              onClose={() => setCreateError(null)}
            >
              {createError}
            </Alert>
          </Box>
        )}
        {error && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}
        {joinError && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Alert severity="error" onClose={() => setJoinError(null)}>
              {joinError}
            </Alert>
          </Box>
        )}

        <TableContainer
          component={Paper}
          sx={{
            width: '100%',
            flex: 1,
            maxHeight: 450,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 10 },
            '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#bdbdbd',
              borderRadius: 5,
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Nom</TableCell>
                <TableCell align="center">Nombre de membres</TableCell>
                {authenticatedUser && (
                  <TableCell align="center">Demande d'adhésion</TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                sortedTeams.map((team) => {
                  const isUserTeam = team.id === currentTeamId;
                  const isPendingForTeam =
                    currentMembership?.status === 'PENDING' &&
                    currentMembership.team.id === team.id;
                  const hasBlockedMembership =
                    Boolean(authenticatedUser?.teamId) ||
                    currentMembership?.status === 'PENDING' ||
                    currentMembership?.status === 'ACCEPTED';

                  return (
                    <TableRow
                      key={team.id}
                      sx={{
                        backgroundColor: isUserTeam ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      <TableCell align="center">{team.name}</TableCell>
                      <TableCell align="center">
                        {team.managersCount + team.membersCount}
                      </TableCell>
                      {authenticatedUser && (
                        <TableCell align="center">
                          {isUserTeam ? (
                            'Ma team'
                          ) : isPendingForTeam ? (
                            'Demande en attente'
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              disabled={hasBlockedMembership}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(
                                    `/api/teams/memberships/${team.id}/membership`,
                                    {
                                      method: 'POST',
                                      headers: {
                                        Authorization: authenticatedUser!.token,
                                      },
                                    },
                                  );
                                  if (!response.ok) {
                                    if (response.status === 403) {
                                      throw new Error(
                                        'Impossible de rejoindre la team :\n un membre possède déjà le même tag',
                                      );
                                    }
                                    throw new Error(
                                      `Erreur ${response.status}`,
                                    );
                                  }

                                  const membershipResponse = await fetch(
                                    '/api/teams/memberships/me',
                                    {
                                      headers: {
                                        Authorization: authenticatedUser!.token,
                                      },
                                    },
                                  );

                                  if (membershipResponse.status === 204) {
                                    setCurrentMembership(null);
                                  } else if (membershipResponse.ok) {
                                    const membershipData: TeamMembership =
                                      await membershipResponse.json();
                                    setCurrentMembership(membershipData);
                                  }
                                } catch (err: unknown) {
                                  if (err instanceof Error)
                                    setJoinError(err.message);
                                  else setJoinError('Erreur inconnue');
                                }
                              }}
                            >
                              {hasBlockedMembership
                                ? 'Indisponible'
                                : 'Rejoindre'}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TeamsListPage;
