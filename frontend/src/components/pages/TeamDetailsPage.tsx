import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
// import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import {
  Team,
  TeamMembership,
  TeamUserProfile,
  UserContextType,
} from '../../types';

type ConfirmAction = 'exclude' | 'designate' | 'leave' | 'renounce' | null;

interface TeamRosterRow {
  membershipId?: number;
  member: TeamUserProfile;
  roleLabel: string;
}

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const { authenticatedUser, setAuthenticatedUser, jwtData } =
    useContext<UserContextType>(UserContext);
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [selectedMember, setSelectedMember] = useState<TeamRosterRow | null>(
    null,
  );

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

  const isPrimaryManager = authenticatedUser?.id === team?.manager?.id;
  const isSecondManager = authenticatedUser?.id === team?.secondManager?.id;
  const isAdmin = Boolean(jwtData()?.isAdmin);
  const canViewMemberEmail = isAdmin || isPrimaryManager || isSecondManager;

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleConfirmAction = async () => {
    if (!team?.id || !authenticatedUser?.token) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      // if (confirmAction === 'exclude' && selectedMember?.membershipId) {
      //   setActionLoading(`exclude-${selectedMember.membershipId}`);
      //   const response = await fetch(
      //     `/api/teams/memberships/${selectedMember.membershipId}`,
      //     {
      //       method: 'DELETE',
      //       headers: {
      //         Authorization: authenticatedUser.token,
      //       },
      //     },
      //   );

      //   if (!response.ok) {
      //     const message = await response.text();
      //     throw new Error(message || `Erreur ${response.status}`);
      //   }

      //   setSuccess(`${selectedMember.member.tag} a bien été exclu de la team.`);
      // }

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

      if (confirmAction === 'leave') {
        setActionLoading('leave');
        const response = await fetch(`/api/teams/${team.id}/leave`, {
          method: 'PATCH',
          headers: {
            Authorization: authenticatedUser.token,
          },
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Erreur ${response.status}`);
        }

        if (authenticatedUser && setAuthenticatedUser) {
          setAuthenticatedUser({ ...authenticatedUser, teamId: undefined });
        }

        setSuccess('Vous avez quitté la team.');
        setConfirmAction(null);
        setSelectedMember(null);
        navigate('/teams');
        return;
      }

      // if (confirmAction === 'renounce') {
      //   setActionLoading('renounce');
      //   const response = await fetch(`/api/teams/${team.id}/manager/renounce`, {
      //     method: 'PATCH',
      //     headers: {
      //       Authorization: authenticatedUser.token,
      //     },
      //   });

      //   if (!response.ok) {
      //     const message = await response.text();
      //     throw new Error(message || `Erreur ${response.status}`);
      //   }

      //   setSuccess('Vous avez renoncé à votre rôle de responsable principal.');
      // }

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
    action: Exclude<ConfirmAction, null>,
    member: TeamRosterRow,
  ) => {
    setSelectedMember(member);
    setConfirmAction(action);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 3, md: 5 },
        minHeight: '100vh',
      }}
    >
      <Stack spacing={3}>
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
            {isPrimaryManager && !team.secondManager && (
              <Alert severity="warning">
                Vous êtes actuellement le seul responsable. Pour quitter la
                team, vous devez d'abord désigner un autre membre comme
                co-responsable.
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
                      // const canExclude =
                      //   isPrimaryManager &&
                      //   Boolean(entry.membershipId) &&
                      //   entry.roleLabel !== 'Responsable';
                      const canDesignate =
                        isPrimaryManager &&
                        entry.roleLabel === 'Membre' &&
                        !team.secondManager;
                      const canSeeLeaveAction =
                        entry.member.id === authenticatedUser?.id;
                      const canUseLeaveAction =
                        entry.roleLabel !== 'Responsable' ||
                        Boolean(team.secondManager);

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
                            {canViewMemberEmail && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {entry.member.email}
                              </Typography>
                            )}
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
                              {/* {canExclude && (
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
                              )} */}
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
                              {canSeeLeaveAction && (
                                <Button
                                  color="warning"
                                  variant="contained"
                                  startIcon={<LogoutOutlinedIcon />}
                                  disabled={!canUseLeaveAction}
                                  onClick={() =>
                                    openMemberAction('leave', entry)
                                  }
                                >
                                  Quitter la team
                                </Button>
                              )}
                              {!canDesignate && !canSeeLeaveAction && (
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
          {/* {confirmAction === 'exclude' && 'Confirmer l’exclusion'} */}
          {confirmAction === 'designate' && 'Confirmer la désignation'}
          {confirmAction === 'leave' && 'Confirmer le départ'}
          {/* {confirmAction === 'renounce' && 'Confirmer le renoncement'} */}
        </DialogTitle>
        <DialogContent>
          {/* {confirmAction === 'exclude' && selectedMember && (
            <Typography>
              {selectedMember.member.tag} sera exclu immédiatement de la team et
              devra effectuer une nouvelle demande s’il souhaite la réintégrer.
            </Typography>
          )} */}
          {confirmAction === 'designate' && selectedMember && (
            <Typography>
              {selectedMember.member.tag} deviendra co-responsable de la team.
              Cette action est uniquement possible tant qu'aucun autre
              co-responsable n'est déjà désigné.
            </Typography>
          )}
          {confirmAction === 'leave' && selectedMember && (
            <Typography>
              {selectedMember.member.tag} va quitter la team.
              {selectedMember.roleLabel === 'Responsable'
                ? ' Le co-responsable deviendra automatiquement responsable principal.'
                : ''}
            </Typography>
          )}
          {/* {confirmAction === 'renounce' && (
            <Typography>
              Vous allez renoncer à votre rôle de responsable principal. Le
              co-responsable actuel prendra automatiquement ce rôle.
            </Typography>
          )} */}
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
            color="primary"
            onClick={handleConfirmAction}
            disabled={actionLoading !== null}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamDetailsPage;
