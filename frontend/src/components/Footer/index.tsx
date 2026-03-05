import { Box, Container, Typography } from '@mui/material';
import logo from '../../assets/images/js-logo.png';
import { Copyright } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box component="footer" className="primary-color" sx={{ py: 3 }}>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'inline-block',
            paddingRight: 2,
            color: '#fff',
          }}
        >
          <Typography sx={{ alignContent: 'center' }}>
            <Copyright />
            CAE Vinci Groupe 21
          </Typography>
        </Box>
        <Box sx={{ display: 'inline-block' }}>
          <img src={logo} alt="" width={50} />
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
