import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import {
  Team,
  TeamMembership,
  TeamUserProfile,
  UserContextType,
} from '../../types';

type ConfirmAction = 'exclude' | 'designate' | 'renounce' | null;

interface TeamRosterRow {
  membershipId?: number;
  member: TeamUserProfile;
  roleLabel: string;
}

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { authenticatedUser } = useContext<UserContextType>(UserContext);

  const [team, setTeam] = useState<Team | null>(null);
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [selectedMember, setSelectedMember] = useState<TeamRosterRow | null>(
    null,
  );
  const [selectedRequest, setSelectedRequest] = useState<TeamMembership | null>(
    null,
  );
  const [refusalReason, setRefusalReason] = useState('');

  useEffect(() => {
    const parsedTeamId = Number(teamId);
    if (!parsedTeamId) {
      setError('Identifiant de team invalide.');
      setLoading(false);
      return;
    }

    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (authenticatedUser?.token) {
          headers['Authorization'] = authenticatedUser.token;
        }

        const teamResponse = await fetch(`/api/teams/${parsedTeamId}`, {
          headers,
        });
        if (!teamResponse.ok) {
          throw new Error(`Erreur ${teamResponse.status}`);
        }

        const membersResponse = await fetch(
          `/api/teams/memberships/${parsedTeamId}/members`,
          { headers },
        );
        if (!membersResponse.ok) {
          throw new Error(`Erreur ${membersResponse.status}`);
        }

        const teamData: Team = await teamResponse.json();
        const membersData: TeamMembership[] = await membersResponse.json();

        setTeam(teamData);
        setMemberships(membersData);

        const viewerIsManager =
          authenticatedUser?.email === teamData.manager?.email ||
          authenticatedUser?.email === teamData.secondManager?.email;

        if (authenticatedUser?.token && viewerIsManager) {
          const requestsResponse = await fetch(
            `/api/teams/memberships/${parsedTeamId}/requests`,
            { headers },
          );

          if (!requestsResponse.ok) {
            throw new Error(`Erreur ${requestsResponse.status}`);
          }

          const requestData: TeamMembership[] = await requestsResponse.json();
          setPendingRequests(requestData);
        } else {
          setPendingRequests([]);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur inconnue est survenue.');
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchTeamData();
  }, [authenticatedUser?.email, authenticatedUser?.token, refreshKey, teamId]);

  const acceptedMemberships = useMemo(
    () => memberships.filter((membership) => membership.status === 'ACCEPTED'),
    [memberships],
  );

  const roster = useMemo(() => {
    if (!team) {
      return [] as TeamRosterRow[];
    }

    const rows = new Map<number, TeamRosterRow>();

    if (team.manager) {
      rows.set(team.manager.id, {
        member: team.manager,
        roleLabel: 'Responsable',
      });
    }

    if (team.secondManager) {
      rows.set(team.secondManager.id, {
        membershipId: acceptedMemberships.find(
          (membership) => membership.member.id === team.secondManager?.id,
        )?.id,
        member: team.secondManager,
        roleLabel: 'Co-responsable',
      });
    }

    acceptedMemberships.forEach((membership) => {
      if (!rows.has(membership.member.id)) {
        rows.set(membership.member.id, {
          membershipId: membership.id,
          member: membership.member,
          roleLabel: 'Membre',
        });
      }
    });

    return Array.from(rows.values());
  }, [acceptedMemberships, team]);

  const isPrimaryManager = authenticatedUser?.email === team?.manager?.email;
  const isManager =
    authenticatedUser?.email === team?.manager?.email ||
    authenticatedUser?.email === team?.secondManager?.email;

  const viewerMembership = memberships.find(
    (membership) => membership.member.email === authenticatedUser?.email,
  );
  const viewerIsInTeam = roster.some(
    (entry) => entry.member.email === authenticatedUser?.email,
  );

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleJoinTeam = async () => {
    if (!authenticatedUser?.token || !team?.id) {
      navigate('/login');
      return;
    }

    setActionLoading('join');
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/teams/memberships/${team.id}/membership`,
        {
          method: 'POST',
          headers: {
            Authorization: authenticatedUser.token,
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur ${response.status}`);
      }

      setSuccess('Votre demande d’adhésion a bien été envoyée.');
      handleRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossible d’envoyer la demande d’adhésion.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (membershipId: number) => {
    if (!authenticatedUser?.token) {
      return;
    }

    setActionLoading(`accept-${membershipId}`);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/teams/memberships/${membershipId}/accept`,
        {
          method: 'PATCH',
          headers: {
            Authorization: authenticatedUser.token,
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur ${response.status}`);
      }

      setSuccess('La demande a été acceptée.');
      handleRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossible d’accepter la demande.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefuseRequest = async () => {
    if (!authenticatedUser?.token || !selectedRequest) {
      return;
    }

    if (!refusalReason.trim()) {
      setError('Le motif du refus est obligatoire.');
      return;
    }

    setActionLoading(`refuse-${selectedRequest.id}`);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/teams/memberships/${selectedRequest.id}/refuse?reason=${encodeURIComponent(refusalReason.trim())}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: authenticatedUser.token,
          },
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur ${response.status}`);
      }

      setSelectedRequest(null);
      setRefusalReason('');
      setSuccess('La demande a été refusée.');
      handleRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossible de refuser la demande.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!team?.id || !authenticatedUser?.token) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      if (confirmAction === 'exclude' && selectedMember?.membershipId) {
        setActionLoading(`exclude-${selectedMember.membershipId}`);
        const response = await fetch(
          `/api/teams/memberships/${selectedMember.membershipId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: authenticatedUser.token,
            },
          },
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Erreur ${response.status}`);
        }

        setSuccess(`${selectedMember.member.tag} a bien été exclu de la team.`);
      }

      if (confirmAction === 'designate' && selectedMember) {
        setActionLoading(`designate-${selectedMember.member.id}`);
        const response = await fetch(
          `/api/teams/${team.id}/second-manager/${selectedMember.member.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: authenticatedUser.token,
            },
          },
        );

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Erreur ${response.status}`);
        }

        setSuccess(
          `${selectedMember.member.tag} est maintenant co-responsable de la team.`,
        );
      }

      if (confirmAction === 'renounce') {
        setActionLoading('renounce');
        const response = await fetch(`/api/teams/${team.id}/manager/renounce`, {
          method: 'PATCH',
          headers: {
            Authorization: authenticatedUser.token,
          },
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Erreur ${response.status}`);
        }

        setSuccess('Vous avez renoncé à votre rôle de responsable principal.');
      }

      setConfirmAction(null);
      setSelectedMember(null);
      handleRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('L’action demandée a échoué.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openMemberAction = (
    action: Exclude<ConfirmAction, 'renounce' | null>,
    member: TeamRosterRow,
  ) => {
    setSelectedMember(member);
    setConfirmAction(action);
  };

  const pendingJoinRequest = viewerMembership?.status === 'PENDING';

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 3, md: 5 },
        minHeight: '100vh',
      }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            background:
              'linear-gradient(140deg, rgba(15,37,78,1) 0%, rgba(38,68,124,0.96) 54%, rgba(219,178,77,0.9) 100%)',
            color: 'white',
            px: { xs: 2.5, md: 4 },
            py: { xs: 3, md: 4 },
            boxShadow: '0 20px 48px rgba(15, 37, 78, 0.22)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 'auto -8% -35% auto',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              filter: 'blur(4px)',
            }}
          />

          <Stack spacing={2} sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate('/teams')}
                sx={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.24)',
                  },
                }}
              >
                Retour aux teams
              </Button>

              {team && (
                <Chip
                  label={
                    isPrimaryManager
                      ? 'Responsable principal'
                      : isManager
                        ? 'Responsable'
                        : 'Consultation'
                  }
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    color: 'white',
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>

            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: '0.18em', opacity: 0.78 }}
              >
                Détails d’une team
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' } }}
              >
                {team?.name ?? 'Chargement de la team'}
              </Typography>
              <Typography sx={{ maxWidth: 720, opacity: 0.9, mt: 1 }}>
                Consultez la composition complète de la team, identifiez les
                rôles de gestion et pilotez les actions de responsable avec
                confirmation.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {loading ? (
          <Paper sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Paper>
        ) : !team ? (
          <Alert severity="warning">Team introuvable.</Alert>
        ) : (
          <>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card sx={{ flex: 1, borderRadius: 3 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    mb={1}
                  >
                    <GroupOutlinedIcon color="primary" />
                    <Typography variant="h6">Composition</Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {roster.length}
                  </Typography>
                  <Typography color="text.secondary">
                    membre{roster.length > 1 ? 's' : ''} affiché
                    {roster.length > 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, borderRadius: 3 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    mb={1}
                  >
                    <SecurityOutlinedIcon color="primary" />
                    <Typography variant="h6">Responsabilité</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {team.manager
                      ? team.manager.tag
                      : 'Aucun responsable principal'}
                  </Typography>
                  <Typography color="text.secondary">
                    {team.secondManager
                      ? `Co-responsable : ${team.secondManager.tag}`
                      : 'Aucun co-responsable désigné pour le moment'}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Adhésion
                  </Typography>

                  {!authenticatedUser ? (
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                    >
                      Se connecter pour rejoindre
                    </Button>
                  ) : viewerIsInTeam ? (
                    <Chip
                      color="success"
                      label="Vous faites partie de cette team"
                    />
                  ) : pendingJoinRequest ? (
                    <Chip
                      color="warning"
                      label="Votre demande est en attente"
                    />
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleJoinTeam}
                      disabled={actionLoading === 'join'}
                    >
                      {actionLoading === 'join'
                        ? 'Envoi...'
                        : 'Demander à rejoindre'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Stack>

            {isPrimaryManager && !team.secondManager && (
              <Alert severity="warning">
                Vous êtes actuellement le seul responsable. Pour renoncer à
                votre rôle, vous devez d'abord désigner un autre membre comme
                responsable.
              </Alert>
            )}

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  background:
                    'linear-gradient(90deg, rgba(15,37,78,0.08) 0%, rgba(219,178,77,0.12) 100%)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Membres de la team
                </Typography>
                <Typography color="text.secondary">
                  Tag, spécialité, rôle et actions de gestion selon vos droits.
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tag</TableCell>
                      <TableCell>Spécialité</TableCell>
                      <TableCell>Rôle</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roster.map((entry) => {
                      const canExclude =
                        isPrimaryManager &&
                        Boolean(entry.membershipId) &&
                        entry.roleLabel !== 'Responsable';
                      const canDesignate =
                        isPrimaryManager &&
                        entry.roleLabel === 'Membre' &&
                        !team.secondManager;

                      return (
                        <TableRow
                          key={entry.member.id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                          }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 700 }}>
                              {entry.member.tag}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entry.member.email}
                            </Typography>
                          </TableCell>
                          <TableCell>{entry.member.speciality}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={
                                entry.roleLabel === 'Responsable'
                                  ? 'primary'
                                  : entry.roleLabel === 'Co-responsable'
                                    ? 'secondary'
                                    : 'default'
                              }
                              label={entry.roleLabel}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              {canExclude && (
                                <Button
                                  color="error"
                                  variant="outlined"
                                  startIcon={<PersonRemoveOutlinedIcon />}
                                  onClick={() =>
                                    openMemberAction('exclude', entry)
                                  }
                                >
                                  Exclure
                                </Button>
                              )}
                              {canDesignate && (
                                <Button
                                  variant="contained"
                                  startIcon={<WorkspacePremiumOutlinedIcon />}
                                  onClick={() =>
                                    openMemberAction('designate', entry)
                                  }
                                >
                                  Désigner responsable
                                </Button>
                              )}
                              {!canExclude && !canDesignate && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ alignSelf: 'center' }}
                                >
                                  Aucune action disponible
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {isPrimaryManager && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Renoncer à mon rôle de responsable
                    </Typography>
                    <Typography color="text.secondary">
                      Cette action transfère automatiquement le rôle principal
                      au co-responsable actuel.
                    </Typography>
                  </Box>
                  <Button
                    color="warning"
                    variant="contained"
                    startIcon={<LogoutOutlinedIcon />}
                    disabled={!team.secondManager}
                    onClick={() => setConfirmAction('renounce')}
                  >
                    Renoncer à mon rôle
                  </Button>
                </Stack>
              </Paper>
            )}

            {isManager && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Demandes en attente
                  </Typography>
                  <Typography color="text.secondary">
                    Validation ou refus des candidatures à la team.
                  </Typography>
                </Box>

                <Divider />

                <Stack spacing={0}>
                  {pendingRequests.length === 0 ? (
                    <Typography sx={{ px: 3, py: 3 }} color="text.secondary">
                      Aucune demande en attente.
                    </Typography>
                  ) : (
                    pendingRequests.map((request) => (
                      <Box key={request.id} sx={{ px: 3, py: 2.5 }}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={2}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', md: 'center' }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {request.member.tag}
                            </Typography>
                            <Typography color="text.secondary">
                              {request.member.speciality} •{' '}
                              {request.member.email}
                            </Typography>
                          </Box>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                          >
                            <Button
                              variant="contained"
                              startIcon={<HowToRegOutlinedIcon />}
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={
                                actionLoading === `accept-${request.id}`
                              }
                            >
                              Accepter
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<CloseOutlinedIcon />}
                              onClick={() => {
                                setSelectedRequest(request);
                                setRefusalReason('');
                              }}
                              disabled={
                                actionLoading === `refuse-${request.id}`
                              }
                            >
                              Refuser
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Stack>

      <Dialog
        open={confirmAction !== null}
        onClose={() => {
          setConfirmAction(null);
          setSelectedMember(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {confirmAction === 'exclude' && 'Confirmer l’exclusion'}
          {confirmAction === 'designate' && 'Confirmer la désignation'}
          {confirmAction === 'renounce' && 'Confirmer le renoncement'}
        </DialogTitle>
        <DialogContent>
          {confirmAction === 'exclude' && selectedMember && (
            <Typography>
              {selectedMember.member.tag} sera exclu immédiatement de la team et
              devra effectuer une nouvelle demande s’il souhaite la réintégrer.
            </Typography>
          )}
          {confirmAction === 'designate' && selectedMember && (
            <Typography>
              {selectedMember.member.tag} deviendra co-responsable de la team.
              action est uniquement possible tant qu'aucun autre co-responsable
              n'est déjà désigné.
            </Typography>
          )}
          {confirmAction === 'renounce' && (
            <Typography>
              Vous allez renoncer à votre rôle de responsable principal. Le
              co-responsable actuel prendra automatiquement ce rôle.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setConfirmAction(null);
              setSelectedMember(null);
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color={confirmAction === 'exclude' ? 'error' : 'primary'}
            onClick={handleConfirmAction}
            disabled={actionLoading !== null}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={selectedRequest !== null}
        onClose={() => {
          setSelectedRequest(null);
          setRefusalReason('');
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Motif du refus</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              Indiquez le motif qui sera associé au refus de la demande de
              {selectedRequest ? ` ${selectedRequest.member.tag}` : ''}.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              value={refusalReason}
              onChange={(event) => setRefusalReason(event.target.value)}
              label="Motif du refus"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setSelectedRequest(null);
              setRefusalReason('');
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRefuseRequest}
            disabled={actionLoading !== null}
          >
            Refuser la demande
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamDetailsPage;
