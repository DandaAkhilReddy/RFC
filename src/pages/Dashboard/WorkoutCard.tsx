import { useState } from 'react';
import { Dumbbell, Edit2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, Collections } from '../../lib/firebase';

interface WorkoutCardProps {
  userEmail: string;
  initialWorkouts: number;
  onUpdate: (workouts: number) => void;
}

export default function WorkoutCard({ userEmail, initialWorkouts, onUpdate }: WorkoutCardProps) {
  const [editing, setEditing] = useState(false);
  const [workouts, setWorkouts] = useState(String(initialWorkouts));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newWorkouts = parseInt(workouts) || 5;
    setSaving(true);

    try {
      await setDoc(
        doc(db, Collections.USER_SETTINGS, userEmail),
        { 
          weeklyWorkoutGoal: newWorkouts,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      onUpdate(newWorkouts);
      setEditing(false);
    } catch (err: any) {
      alert('Error saving: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-gray-600">Weekly Goal</p>
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
                value={workouts}
                onChange={(e) => setWorkouts(e.target.value)}
                className="w-32 px-2 py-1 border rounded text-lg font-bold"
              />
              <button onClick={handleSave} className="px-3 py-1 bg-orange-600 text-white text-xs rounded">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setWorkouts(String(initialWorkouts)); }} className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded">
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-orange-600">{initialWorkouts} workouts</p>
          )}
        </div>
        
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-orange-600" />
        </div>
      </div>
    </div>
  );
}
