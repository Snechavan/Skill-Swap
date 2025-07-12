import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Skill, Availability } from '../types';
import { 
  Edit, 
  Save, 
  X, 
  Plus, 
  MapPin, 
  Star, 
  Award
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUserProfile, loading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillType, setSkillType] = useState<'offered' | 'wanted'>('offered');
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 'intermediate' as const });
  const [availability, setAvailability] = useState<Availability>(user?.availability || { weekends: false, evenings: false });
  const [isPublic, setIsPublic] = useState<boolean>(user?.isPublic || true);

  if (!user) {
    return <LoadingSpinner />;
  }

  const handleSave = async () => {
    try {
      await updateUserProfile({
        availability,
        isPublic
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name,
      category: newSkill.category,
      level: newSkill.level
    };

    const updatedSkills = skillType === 'offered' 
      ? [...user.skillsOffered, skill]
      : [...user.skillsWanted, skill];

    try {
      await updateUserProfile({
        [skillType === 'offered' ? 'skillsOffered' : 'skillsWanted']: updatedSkills
      });
      setNewSkill({ name: '', category: '', level: 'intermediate' });
      setShowAddSkill(false);
      toast.success('Skill added successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: string, type: 'offered' | 'wanted') => {
    const updatedSkills = type === 'offered'
      ? user.skillsOffered.filter(s => s.id !== skillId)
      : user.skillsWanted.filter(s => s.id !== skillId);

    try {
      await updateUserProfile({
        [type === 'offered' ? 'skillsOffered' : 'skillsWanted']: updatedSkills
      });
      toast.success('Skill removed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove skill');
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your skills and preferences</p>
        </div>
        <Button
          variant={isEditing ? 'outline' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
          loading={loading}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-warning-500 mr-2" />
                  <span className="text-sm text-gray-600">Trust Score</span>
                </div>
                <span className="font-semibold text-gray-900">{user.trustScore}/100</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-primary-500 mr-2" />
                  <span className="text-sm text-gray-600">Points</span>
                </div>
                <span className="font-semibold text-gray-900">{user.points}</span>
              </div>

              {user.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{user.location}</span>
                </div>
              )}
            </div>

            {/* Badges */}
            {user.badges.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                      title={badge.description}
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills and Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Offered */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills Offered</h3>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSkillType('offered');
                    setShowAddSkill(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200"
                >
                  <span className={`px-2 py-1 text-xs rounded-full ${getSkillLevelColor(skill.level)}`}>
                    {skill.name}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(skill.id, 'offered')}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {user.skillsOffered.length === 0 && (
                <p className="text-gray-500 text-sm">No skills offered yet</p>
              )}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills Wanted</h3>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSkillType('wanted');
                    setShowAddSkill(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary-50 border border-secondary-200"
                >
                  <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-800 rounded-full">
                    {skill.name}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(skill.id, 'wanted')}
                      className="text-secondary-600 hover:text-secondary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {user.skillsWanted.length === 0 && (
                <p className="text-gray-500 text-sm">No skills wanted yet</p>
              )}
            </div>
          </div>

          {/* Settings */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              
              <div className="space-y-4">
                {/* Availability */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={availability.weekends}
                        onChange={(e) => setAvailability({ ...availability, weekends: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Weekends</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={availability.evenings}
                        onChange={(e) => setAvailability({ ...availability, evenings: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Evenings</span>
                    </label>
                  </div>
                </div>

                {/* Profile Visibility */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Visibility</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Public Profile</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button onClick={handleSave} loading={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add {skillType === 'offered' ? 'Offered' : 'Wanted'} Skill
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Skill Name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., JavaScript, Cooking, Guitar"
              />
              
              <Input
                label="Category"
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                placeholder="e.g., Technology, Arts, Sports"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddSkill(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSkill}
                disabled={!newSkill.name.trim()}
              >
                Add Skill
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 