import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext'; 
import { CosmoProvider } from './contexts/CosmoContext';
import { ModalProvider } from './contexts/ModalContext';
import AppContent from './components/common/AppContent';

function App() {
  return (
    <BrowserRouter>
      <SupabaseProvider>
        <CosmoProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </CosmoProvider>
      </SupabaseProvider>
    </BrowserRouter>
  );
}

export default App;