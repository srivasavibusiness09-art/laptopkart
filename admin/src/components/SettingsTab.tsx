import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save } from 'lucide-react';

interface SettingsTabProps {
  triggerAlert: (type: 'success' | 'danger', message: string) => void;
}

export default function SettingsTab({ triggerAlert }: SettingsTabProps) {
  const [mission, setMission] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          setMission(snap.data().mission || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), { mission }, { merge: true });
      triggerAlert('success', 'Settings saved successfully');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>Loading settings...</div>;

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Settings</h1>
      <p style={{ color: '#8B9BBE', fontSize: 15, marginBottom: 32 }}>Manage global website configurations.</p>
      
      <div style={{ background: '#1a2235', borderRadius: 16, padding: 24, border: '1px solid rgba(56,189,248,0.1)', maxWidth: 800 }}>
        <h2 style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>Our Mission Statement</h2>
        <p style={{ color: '#8B9BBE', fontSize: 13, marginBottom: 16 }}>This text will appear in the "Our Mission" section on the frontend.</p>
        
        <textarea 
          value={mission} 
          onChange={e => setMission(e.target.value)} 
          className="form-input" 
          style={{ width: '100%', minHeight: 150, marginBottom: 20 }}
          placeholder="Enter the mission statement here..."
        />
        
        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#38BDF8', color: '#000', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 800, cursor: 'pointer' }}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
