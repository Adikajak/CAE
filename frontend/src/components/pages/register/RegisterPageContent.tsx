import { Box } from '@mui/material';
import RegisterFormContainer from './components/RegisterFormContainer';

const RegisterPageContent = () => (
  <Box
    sx={{
      margin: { xs: 2, md: 4 },
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <RegisterFormContainer />
  </Box>
);

export default RegisterPageContent;
