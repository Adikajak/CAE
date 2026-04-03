import { Avatar, Box, Button, Link, Typography } from '@mui/material';
import { UserPublicProfile } from '../../../../types';

const formatDate = (date: string) => date.split('-').reverse().join('/');

type MemberInfoProps = {
  member: UserPublicProfile;
  isAdmin: boolean;
  currentUserId?: number;
  onNavigateToTeam: (teamId: number) => void;
  onOpenBanModal: () => void;
};

const MemberInfo = ({
  member,
  isAdmin,
  currentUserId,
  onNavigateToTeam,
  onOpenBanModal,
}: MemberInfoProps) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ mt: 4 }}>
          {member.tag}
        </Typography>
        <Avatar
          src={member.profilePicture}
          alt={member.tag}
          sx={{ width: 120, height: 120 }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'text.primary',
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {member.speciality}
        </Typography>
        {member.teamId ? (
          <Link
            variant="body1"
            color="info.main"
            sx={{ cursor: 'pointer' }}
            onClick={() => onNavigateToTeam(member.teamId!)}
          >
            {member.teamName}
          </Link>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Aucune team
          </Typography>
        )}
        <Typography variant="body2" color="text.disabled">
          Membre depuis le {formatDate(member.date)}
        </Typography>
      </Box>
      {member.isBanned ? (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Ce membre ne fait plus partie de la plateforme.
        </Typography>
      ) : (
        isAdmin &&
        member.id !== currentUserId && (
          <Button variant="contained" color="error" onClick={onOpenBanModal}>
            Bannir
          </Button>
        )
      )}
    </>
  );
};

export default MemberInfo;
