import { useContext, useEffect, useState } from 'react';
import { Box, Button, Alert, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContextType, Notification } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';

const NotificationPage = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/', {
          headers: { Authorization: authenticatedUser.token },
        });
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Une erreur inconnue est survenue');
        }
      }
    };

    fetchNotifications();
  }, [authenticatedUser, navigate]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: authenticatedUser!.token },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inconnue est survenue');
      }
    }
  };

  if (!authenticatedUser)
    return <p>Vous devez être connecté pour voir cette page.</p>;

  return (
    <Box sx={{ margin: 2, padding: 3 }}>
      <h1>Notifications</h1>

      {error && <Alert severity="error">{error}</Alert>}

      {notifications.length === 0 ? (
        <p>Aucune notification</p>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((n) => (
            <Box
              key={n.notificationId}
              sx={{
                padding: 2,
                border: '1px solid grey',
                borderRadius: 2,
                opacity: n.isRead ? 0.6 : 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">{n.object}</Typography>
                {!n.isRead && (
                  <Chip label="Non lu" color="primary" size="small" />
                )}
              </Box>
              <Typography>{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.createdAt).toLocaleString()}
              </Typography>
              {!n.isRead && (
                <Box sx={{ marginTop: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => markAsRead(n.notificationId)}
                  >
                    Marquer comme lu
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NotificationPage;
