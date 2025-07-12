import React, { useState } from 'react';
import { User, Skill } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

interface SwapRequestModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (skillsExchanged: { offered: Skill[]; wanted: Skill[] }, message?: string) => Promise<void>;
  loading: boolean;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  user,
  onClose,
  onSubmit,
  loading
}) => {
  const { user: currentUser } = useAuthStore();
  const [selectedOfferedSkills, setSelectedOfferedSkills] = useState<Skill[]>([]);
  const [selectedWantedSkills, setSelectedWantedSkills] = useState<Skill[]>([]);
  const [message, setMessage] = useState('');

  const handleSkillToggle = (
    skill: Skill,
    skillList: Skill[],
    setSkillList: React.Dispatch<React.SetStateAction<Skill[]>>
  ) => {
    const isSelected = skillList.some(s => s.id === skill.id);
    if (isSelected) {
      setSkillList(skillList.filter(s => s.id !== skill.id));
    } else {
      setSkillList([...skillList, skill]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOfferedSkills.length === 0 || selectedWantedSkills.length === 0) {
      return;
    }
    
    await onSubmit({
      offered: selectedOfferedSkills,
      wanted: selectedWantedSkills
    }, message);
  };

  const canSubmit = selectedOfferedSkills.length > 0 && selectedWantedSkills.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Request Skill Swap</h2>
              <p className="text-sm text-gray-600">with {user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Skills Exchange Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Your Skills (Offered) */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Your Skills (What you'll teach)
              </h3>
              <div className="space-y-2">
                {currentUser?.skillsOffered.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOfferedSkills.some(s => s.id === skill.id)}
                      onChange={() => handleSkillToggle(skill, selectedOfferedSkills, setSelectedOfferedSkills)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{skill.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{skill.level}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Their Skills (Wanted) */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {user.name}'s Skills (What you'll learn)
              </h3>
              <div className="space-y-2">
                {user.skillsOffered.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWantedSkills.some(s => s.id === skill.id)}
                      onChange={() => handleSkillToggle(skill, selectedWantedSkills, setSelectedWantedSkills)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{skill.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{skill.level}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Skills Summary */}
          {(selectedOfferedSkills.length > 0 || selectedWantedSkills.length > 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Swap Summary</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">You'll teach:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOfferedSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">You'll learn:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWantedSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 text-xs bg-secondary-100 text-secondary-800 rounded-full"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and suggest how you'd like to arrange the skill swap..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            loading={loading}
          >
            Send Request
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal; 