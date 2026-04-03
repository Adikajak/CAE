import { TeamsListContextProvider } from '../../../contexts/TeamsListContext';
import TeamsListPageContent from './TeamsListPageContent';

const TeamsListPage = () => {
  return (
    <TeamsListContextProvider>
      <TeamsListPageContent />
    </TeamsListContextProvider>
  );
};

export default TeamsListPage;
