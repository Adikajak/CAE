import { MemberDetailsContextProvider } from '../../../contexts/MemberDetailsContext';
import MemberDetailsPageContent from './MemberDetailsPageContent';

const MemberDetailsPage = () => {
  return (
    <MemberDetailsContextProvider>
      <MemberDetailsPageContent />
    </MemberDetailsContextProvider>
  );
};

export default MemberDetailsPage;
