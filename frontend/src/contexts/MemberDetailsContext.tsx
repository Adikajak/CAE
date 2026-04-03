import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  MemberDetailsContextType,
  UserContextType,
  UserPublicProfile,
} from '../types';
import { fetchMemberById, banMember } from '../services/membersService';
import { UserContext } from './UserContext';

const defaultMemberDetailsContext: MemberDetailsContextType = {
  loading: true,
  error: null,
  member: null,
  openBanModal: false,
  banError: '',
  setOpenBanModal: () => {},
  handleBanMember: async () => {},
};

const MemberDetailsContext = createContext<MemberDetailsContextType>(
  defaultMemberDetailsContext,
);

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return 'Une erreur inconnue est survenue';
};

const MemberDetailsContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { memberId } = useParams();
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<UserPublicProfile | null>(null);
  const [openBanModal, setOpenBanModal] = useState(false);
  const [banError, setBanError] = useState('');

  const parsedId = Number(memberId);

  const loadMember = useCallback(async () => {
    if (isNaN(parsedId)) {
      setError('Identifiant de membre invalide');
      return;
    }
    try {
      const fetched = await fetchMemberById(parsedId);
      setMember(fetched);
      setError(null);
    } catch (fetchError: unknown) {
      const msg = getErrorMessage(fetchError);
      setError(msg === 'Erreur 404' ? 'Membre introuvable.' : msg);
    }
  }, [parsedId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadMember();
      setLoading(false);
    };
    void fetchData();
  }, [loadMember]);

  const handleBanMember = async () => {
    if (!authenticatedUser || !member) return;
    try {
      await banMember(authenticatedUser.token, member.id);
      setOpenBanModal(false);
      setBanError('');
      await loadMember();
    } catch (err: unknown) {
      setBanError(getErrorMessage(err));
    }
  };

  const memberDetailsContextValue: MemberDetailsContextType = {
    loading,
    error,
    member,
    openBanModal,
    banError,
    setOpenBanModal,
    handleBanMember,
  };

  return (
    <MemberDetailsContext.Provider value={memberDetailsContextValue}>
      {children}
    </MemberDetailsContext.Provider>
  );
};

export { MemberDetailsContext, MemberDetailsContextProvider };
