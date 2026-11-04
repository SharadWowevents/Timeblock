import { useState } from 'react';
import { useAppContext } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import PrivacyPolicyAgreement from './components/PrivacyPolicyAgreement';
import './index.css';

export default function App() {
  const { token, currentUser, acceptPrivacyPolicy, logout } = useAppContext();
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // If there is no token or user loaded, show Auth Screen
  if (!token || !currentUser) {
    return <AuthScreen />;
  }

  if (!currentUser.privacyPolicyAcceptedAt) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsSaving(true);

      try {
        await acceptPrivacyPolicy();
      } catch (err) {
        setError(err.message || 'Could not save Privacy Policy acceptance.');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="modal-overlay">
        <section className="modal privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
          <h2 id="privacy-title">Privacy Policy</h2>
          <p className="modal-subtitle">Please review and accept to continue using Timeblock.</p>
          <form onSubmit={handleSubmit}>
            <PrivacyPolicyAgreement
              checked={privacyPolicyAccepted}
              onChange={e => setPrivacyPolicyAccepted(e.target.checked)}
              required
            />
            {error && <p className="field-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={logout}>Log out</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Agree and continue'}
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  return <Dashboard />;
}