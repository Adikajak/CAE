import { useContext, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Alert,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContextType, Notification as NotificationType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';
const NotificationPage = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [declineId, setDeclineId] = useState<number | null>(null);
  const [declineNotificationId, setDeclineNotificationId] = useState<
    number | null
  >(null);
  const [decidedIds, setDecidedIds] = useState<Set<number>>(new Set());
  const [reason, setReason] = useState('');
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!authenticatedUser) return;
    try {
      const response = await fetch('/api/notifications/', {
        headers: { Authorization: authenticatedUser.token },
      });
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data: NotificationType[] = await response.json();
      setNotifications(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Une erreur inconnue est survenue');
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [authenticatedUser, navigate, fetchNotifications]);

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
      if (err instanceof Error) setError(err.message);
      else setError('Une erreur inconnue est survenue');
    }
  };

  const handleAccept = async (membershipId: number, notificationId: number) => {
    try {
      const response = await fetch(
        `/api/teams/memberships/${membershipId}/accept`,
        {
          method: 'PATCH',
          headers: { Authorization: authenticatedUser!.token },
        },
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      await markAsRead(notificationId);
      fetchNotifications();
      setDecidedIds((prev) => new Set(prev).add(membershipId));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Une erreur inconnue est survenue');
    }
  };

  const handleDecline = async () => {
    if (!declineId || !declineNotificationId) return;
    try {
      const response = await fetch(
        `/api/teams/memberships/${declineId}/refuse?reason=${encodeURIComponent(reason)}`,
        {
          method: 'PATCH',
          headers: { Authorization: authenticatedUser!.token },
        },
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      await markAsRead(declineNotificationId);
      setDeclineId(null);
      setReason('');
      fetchNotifications();
      setDecidedIds((prev) => new Set(prev).add(declineId!));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Une erreur inconnue est survenue');
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                }}
                onClick={() =>
                  setExpandedId(
                    expandedId === n.notificationId ? null : n.notificationId,
                  )
                }
              >
                <Typography variant="h6">{n.object}</Typography>
                {!n.isRead && (
                  <Chip label="Non lu" color="primary" size="small" />
                )}
                <Typography variant="caption" sx={{ ml: 'auto' }}>
                  {expandedId === n.notificationId ? '▲' : '▼'}
                </Typography>
              </Box>
              {/* Expanded details */}
              {expandedId === n.notificationId && (
                <Box sx={{ marginTop: 1 }}>
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
                  {n.type === 'TEAM_INVITATION' &&
                    !n.isRead &&
                    !decidedIds.has(n.membershipId!) && (
                      <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            handleAccept(n.membershipId!, n.notificationId)
                          }
                        >
                          Accepter
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setDeclineId(n.membershipId!);
                            setDeclineNotificationId(n.notificationId);
                          }}
                        >
                          Refuser
                        </Button>
                      </Box>
                    )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={declineId !== null} onClose={() => setDeclineId(null)}>
        <DialogTitle>Refuser la demande</DialogTitle>
        <DialogContent>
          <TextField
            label="Raison du refus"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ marginTop: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineId(null)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDecline}>
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationPage;
