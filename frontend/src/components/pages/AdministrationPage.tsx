import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { UserContextType, UserProfile } from '../../types';
import { UserContext } from '../../contexts/UserContext';

const AdministrationPage = () => {
  const { authenticatedUser, jwtData } =
    useContext<UserContextType>(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [administrationList, setAdministrationList] = useState<
    UserProfile[] | null
  >(null);

  useEffect(() => {
    if (!authenticatedUser) return;

    const handleFetchAdministrators = async () => {
      try {
        const response = await fetch('/api/administrators/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser.token,
          },
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data: UserProfile[] | null = await response.json();
        setAdministrationList(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur inconnue est survenue');
        }
      } finally {
        setLoading(false);
      }
    };

    handleFetchAdministrators();
  }, [authenticatedUser]);

  if (!authenticatedUser || !jwtData()?.isAdmin)
    return <p>Vous devez être administrateur pour voir cette page.</p>;
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <Box sx={{ margin: 2, padding: 3, textAlign: 'center' }}>
      <h1>Administration</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>email</TableCell>
            <TableCell>tag</TableCell>
            <TableCell>spécialité</TableCell>
            <TableCell>date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {administrationList?.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.tag}</TableCell>
              <TableCell>{admin.speciality}</TableCell>
              <TableCell>{admin.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AdministrationPage;
