import { useContext } from 'react';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MemberDetailsContext } from '../../../contexts/MemberDetailsContext';
import { UserContext } from '../../../contexts/UserContext';
import { MemberDetailsContextType, UserContextType } from '../../../types';
import MemberInfo from './components/MemberInfo';
import BanMemberDialog from './components/BanMemberDialog';

const MemberDetailsPageContent = () => {
  const {
    loading,
    error,
    member,
    openBanModal,
    banError,
    setOpenBanModal,
    handleBanMember,
  } = useContext<MemberDetailsContextType>(MemberDetailsContext);
  const { jwtData } = useContext<UserContextType>(UserContext);
  const navigate = useNavigate();

  const isAdmin = jwtData()?.isAdmin ?? false;
  const currentUserId = jwtData()?.id;

  if (error)
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Container>
    );

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
    >
      <Box
        sx={{
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {loading || !member ? (
          <CircularProgress />
        ) : (
          <MemberInfo
            member={member}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onNavigateToTeam={(teamId) => navigate(`/teams/${teamId}`)}
            onOpenBanModal={() => setOpenBanModal(true)}
          />
        )}
      </Box>

      <BanMemberDialog
        open={openBanModal}
        memberTag={member?.tag ?? ''}
        banError={banError}
        onClose={() => setOpenBanModal(false)}
        onConfirm={handleBanMember}
      />
    </Container>
  );
};

export default MemberDetailsPageContent;
