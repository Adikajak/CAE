import { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  CreateTournamentPayload,
  Tournament,
  PublishTournamentPayload,
} from '../../../../types';
import { useNavigate } from 'react-router-dom';
import EditTournamentDialog from './EditTournamentDialog';
import PublishTournamentDialog from './PublishTournamentDialog';

type TournamentTableProps = {
  tournamentList: Tournament[] | null;
  showOnlyName?: boolean;
  isAdmin?: boolean;
  onPublishTournament?: (
    tournamentId: number,
    payload: PublishTournamentPayload,
  ) => Promise<void>;
  isPublishing?: boolean;
  onEditTournament?: (
    tournament: Tournament,
    payload: CreateTournamentPayload,
  ) => Promise<void>;
  isEditing?: boolean;
  registeredTournamentIds?: Set<number>;
};

const formatDate = (date: string) => date.split('-').reverse().join('/');

const canPublishTournament = (tournament: Tournament): boolean => {
  return tournament.state === 'IN_PREPARATION';
};

const canEditTournament = (tournament: Tournament): boolean => {
  return tournament.state === 'IN_PREPARATION';
};

const getStatusConfig = (state: string) => {
  switch (state) {
    case 'IN_PREPARATION':
      return { color: '#9E9E9E', label: 'En préparation' };
    case 'PLANIFIED':
      return { color: '#2196F3', label: 'Planifié' };
    case 'OPEN':
      return { color: '#4CAF50', label: 'Ouvert' };
    case 'ONGOING':
      return { color: '#FFA500', label: 'En cours' };
    default:
      return { color: '#9E9E9E', label: state || 'Inconnu' };
  }
};

type PendingPublish = {
  id: number;
  name: string;
  payload: PublishTournamentPayload;
};

const TournamentTable = ({
  tournamentList,
  showOnlyName = false,
  isAdmin = false,
  onPublishTournament,
  isPublishing = false,
  onEditTournament,
  isEditing = false,
  registeredTournamentIds,
}: TournamentTableProps) => {
  const navigate = useNavigate();
  const [pendingPublish, setPendingPublish] = useState<PendingPublish | null>(
    null,
  );
  const [pendingEdit, setPendingEdit] = useState<Tournament | null>(null);

  if (!tournamentList || tournamentList.length === 0) {
    return (
      <Paper sx={{ padding: 2 }}>
        <p>Aucun tournoi actuellement.</p>
      </Paper>
    );
  }
  if (showOnlyName) {
    return (
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}
      >
        <Table size="small">
          <TableBody>
            {tournamentList.map((tournament) => {
              const { color, label } = getStatusConfig(tournament.state);
              return (
                <TableRow
                  key={tournament.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                >
                  <TableCell
                    sx={{
                      color: '#F6F7FF',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      width: '70%',
                    }}
                  >
                    {tournament.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      width: '30%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: color,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#C8CEDE' }}>
                        {label}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Nom</TableCell>
            <TableCell align="center">Description</TableCell>
            <TableCell align="center">État</TableCell>
            <TableCell align="center">Date de début</TableCell>
            <TableCell align="center">Date de fin</TableCell>
            <TableCell align="center">Début des inscriptions</TableCell>
            <TableCell align="center">Fin des inscriptions</TableCell>
            <TableCell align="center">Nombre de teams inscrites</TableCell>
            <TableCell align="center">Max équipes</TableCell>
            {isAdmin && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {tournamentList?.map((tournament) => {
            const isRegistered =
              registeredTournamentIds?.has(tournament.id) ?? false;
            return (
              <TableRow
                key={tournament.id}
                hover
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isRegistered
                    ? 'rgba(2, 136, 209, 0.1)'
                    : undefined,
                }}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              >
                <TableCell align="center">{tournament.name}</TableCell>
                <TableCell align="center">{tournament.description}</TableCell>
                <TableCell align="center">
                  {tournament.stateDisplayName}
                </TableCell>
                <TableCell align="center">
                  {formatDate(tournament.startDate)}
                </TableCell>
                <TableCell align="center">
                  {formatDate(tournament.endDate)}
                </TableCell>
                <TableCell align="center">
                  {formatDate(tournament.startInscriptionDate)}
                </TableCell>
                <TableCell align="center">
                  {formatDate(tournament.endInscriptionDate)}
                </TableCell>
                <TableCell align="center">
                  {tournament.registrationsCount} / {tournament.maxTeams}
                </TableCell>
                <TableCell align="center">{tournament.maxTeams}</TableCell>
                {isAdmin && (
                  <TableCell align="center">
                    <Box
                      sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        disabled={!canEditTournament(tournament) || isEditing}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingEdit(tournament);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={
                          !canPublishTournament(tournament) || isPublishing
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingPublish({
                            id: tournament.id,
                            name: tournament.name,
                            payload: {
                              name: tournament.name,
                              description: tournament.description,
                              startDate: tournament.startDate,
                              endDate: tournament.endDate,
                              startInscriptionDate:
                                tournament.startInscriptionDate,
                              endInscriptionDate: tournament.endInscriptionDate,
                              maxTeams: tournament.maxTeams,
                              state: 'PLANIFIED',
                            },
                          });
                        }}
                      >
                        Publier
                      </Button>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {pendingEdit && (
        <EditTournamentDialog
          key={pendingEdit.id}
          open
          tournament={pendingEdit}
          isEditing={isEditing}
          onClose={() => setPendingEdit(null)}
          onConfirm={async (payload) => {
            if (onEditTournament) {
              await onEditTournament(pendingEdit, payload);
            }
            setPendingEdit(null);
          }}
        />
      )}
      <PublishTournamentDialog
        open={pendingPublish !== null}
        tournamentName={pendingPublish?.name ?? ''}
        isPublishing={isPublishing}
        onClose={() => setPendingPublish(null)}
        onConfirm={() => {
          if (pendingPublish && onPublishTournament) {
            void onPublishTournament(
              pendingPublish.id,
              pendingPublish.payload,
            ).then(() => setPendingPublish(null));
          }
        }}
      />
    </TableContainer>
  );
};

export default TournamentTable;
