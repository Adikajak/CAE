import { useContext } from 'react';
import { Box } from '@mui/material';
import { ProfileContextType } from '../../../types';
import { ProfileContext } from '../../../contexts/ProfileContext';
import ProfileInfo from './components/ProfileInfo';
import PrivateInfo from './components/PrivateInfo';
import ChangePasswordDialog from './components/ChangePasswordDialog';
import AddUnavailabilityDialog from './components/AddUnavailabilityDialog';
import ChangeSpecialityDialog from './components/ChangeSpecialityDialog';
import ChangePictureDialog from './components/ChangePictureDialog';

const ProfilePageContent = () => {
  const { loading, error } = useContext<ProfileContextType>(ProfileContext);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <Box sx={{ margin: 2, padding: 3, textAlign: 'center' }}>
      <h1>Mon Espace personnel</h1>
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        <ProfileInfo />
        <PrivateInfo />
      </Box>
      <ChangePasswordDialog />
      <AddUnavailabilityDialog />
      <ChangeSpecialityDialog />
      <ChangePictureDialog />
    </Box>
  );
};

export default ProfilePageContent;
