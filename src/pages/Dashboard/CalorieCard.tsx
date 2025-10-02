import { useState } from 'react';
import { Utensils, Edit2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, Collections } from '../../lib/firebase';

interface CalorieCardProps {
  userEmail: string;
  initialCalories: number;
  onUpdate: (calories: number) => void;
}

export default function CalorieCard({ userEmail, initialCalories, onUpdate }: CalorieCardProps) {
  const [editing, setEditing] = useState(false);
  const [calories, setCalories] = useState(String(initialCalories));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const newCalories = parseInt(calories) || 2000;
    setSaving(true);
    setError('');

    try {
      console.log('[CalorieCard] Saving to Firebase:', userEmail, newCalories);
      
      await setDoc(
        doc(db, Collections.USER_SETTINGS, userEmail),
        { 
          calorieGoal: newCalories,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      console.log('[CalorieCard] Save successful!');
      onUpdate(newCalories);
      setEditing(false);
    } catch (err: any) {
      console.error('[CalorieCard] Save failed:', err);
      setError(err.message || 'Failed to save');
      alert('Error saving calories: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCalories(String(initialCalories));
    setEditing(false);
    setError('');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-gray-600">Daily Calorie Goal</p>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-orange-600 hover:text-orange-700">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-32 px-2 py-1 border rounded text-lg font-bold"
                disabled={saving}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-orange-600">{initialCalories.toLocaleString()} cal</p>
          )}
          
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Utensils className="w-6 h-6 text-orange-600" />
        </div>
      </div>
    </div>
  );
}
