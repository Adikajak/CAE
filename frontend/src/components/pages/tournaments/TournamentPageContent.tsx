import { useContext } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { TournamentContext } from '../../../contexts/TournamentContext';
import { TournamentContextType } from '../../../types';
import TournamentActions from './components/TournamentActions';
import TournamentCreateFormContainer from './components/TournamentCreateFormContainer';
import TournamentFilters from './components/TournamentFilters';
import TournamentTable from './components/TournamentTable';

const TournamentPageContent = () => {
  const {
    loading,
    error,
    filteredTournaments,
    helpText,
    isAdmin,
    publishError,
    publishSuccess,
    editError,
    editSuccess,
    handlePublishTournament,
    publishing,
    handleEditTournament,
    editing,
    registeredTournamentIds,
  } = useContext<TournamentContextType>(TournamentContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <p>Erreur : {error}</p>;
  }

  return (
    <Box sx={{ margin: 2, padding: 3, textAlign: 'center' }}>
      <TournamentActions />
      {isAdmin && <TournamentCreateFormContainer />}
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        {helpText}
      </Typography>
      {publishError && (
        <Box sx={{ color: 'error.main', marginBottom: 2 }}>
          Erreur : {publishError}
        </Box>
      )}
      {publishSuccess && (
        <Box sx={{ color: 'success.main', marginBottom: 2 }}>
          {publishSuccess}
        </Box>
      )}
      {editError && (
        <Box sx={{ color: 'error.main', marginBottom: 2 }}>
          Erreur : {editError}
        </Box>
      )}
      {editSuccess && (
        <Box sx={{ color: 'success.main', marginBottom: 2 }}>{editSuccess}</Box>
      )}
      <TournamentFilters />
      <TournamentTable
        tournamentList={filteredTournaments}
        isAdmin={isAdmin}
        onPublishTournament={handlePublishTournament}
        isPublishing={publishing}
        onEditTournament={handleEditTournament}
        isEditing={editing}
        registeredTournamentIds={registeredTournamentIds}
      />
    </Box>
  );
};

export default TournamentPageContent;
