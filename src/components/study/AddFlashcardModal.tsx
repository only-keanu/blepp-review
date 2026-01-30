import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Flashcard } from '../../types';
interface AddFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flashcard: Flashcard) => void;
}
const TOPICS = [
{
  value: 'General Psychology',
  label: 'General Psychology'
},
{
  value: 'Abnormal Psychology',
  label: 'Abnormal Psychology'
},
{
  value: 'Psychological Assessment',
  label: 'Psychological Assessment'
},
{
  value: 'Industrial/Org Psychology',
  label: 'Industrial/Org Psychology'
},
{
  value: 'Ethics (RA 10029)',
  label: 'Ethics (RA 10029)'
},
{
  value: 'Developmental Psych',
  label: 'Developmental Psychology'
},
{
  value: 'History of Psych',
  label: 'History of Psychology'
},
{
  value: 'Learning',
  label: 'Learning & Conditioning'
},
{
  value: 'Memory',
  label: 'Memory & Cognition'
},
{
  value: 'Social Psychology',
  label: 'Social Psychology'
}];

const CATEGORIES = [
{
  value: 'definitions',
  label: 'Definitions'
},
{
  value: 'theories',
  label: 'Theories & Models'
},
{
  value: 'people',
  label: 'Key Figures'
},
{
  value: 'disorders',
  label: 'Disorders'
},
{
  value: 'research',
  label: 'Research Studies'
},
{
  value: 'laws',
  label: 'Laws & Ethics'
},
{
  value: 'other',
  label: 'Other'
}];

export function AddFlashcardModal({
  isOpen,
  onClose,
  onSave
}: AddFlashcardModalProps) {
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    topic: '',
    category: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.front.trim()) {
      newErrors.front = 'Front side is required';
    }
    if (!formData.back.trim()) {
      newErrors.back = 'Back side is required';
    }
    if (!formData.topic) {
      newErrors.topic = 'Please select a topic';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    const newFlashcard: Flashcard = {
      id: `fc_${Date.now()}`,
      front: formData.front,
      back: formData.back,
      topic: formData.topic,
      category: formData.category || undefined,
      confidence: undefined,
      createdAt: new Date().toISOString()
    };
    onSave(newFlashcard);
    handleReset();
    onClose();
  };
  const handleReset = () => {
    setFormData({
      front: '',
      back: '',
      topic: '',
      category: ''
    });
    setErrors({});
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Flashcard"
      size="md"
      footer={
      <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Flashcard</Button>
        </>
      }>

      <div className="space-y-5">
        {/* Front Side */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Front Side (Question/Term) <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border ${errors.front ? 'border-red-300' : 'border-slate-300'} shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 text-sm min-h-[100px]`}
            placeholder="What do you want to remember? (e.g., 'What is classical conditioning?')"
            value={formData.front}
            onChange={(e) =>
            setFormData({
              ...formData,
              front: e.target.value
            })
            } />

          {errors.front &&
          <p className="mt-1 text-sm text-red-600">{errors.front}</p>
          }
        </div>

        {/* Back Side */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Back Side (Answer/Definition){' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border ${errors.back ? 'border-red-300' : 'border-slate-300'} shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 text-sm min-h-[100px]`}
            placeholder="The answer or explanation (e.g., 'A learning process where a neutral stimulus becomes associated with a meaningful stimulus...')"
            value={formData.back}
            onChange={(e) =>
            setFormData({
              ...formData,
              back: e.target.value
            })
            } />

          {errors.back &&
          <p className="mt-1 text-sm text-red-600">{errors.back}</p>
          }
        </div>

        {/* Topic and Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Topic"
            options={TOPICS}
            value={formData.topic}
            onChange={(value) =>
            setFormData({
              ...formData,
              topic: value
            })
            }
            placeholder="Select topic..."
            searchable />

          <Select
            label="Category (Optional)"
            options={CATEGORIES}
            value={formData.category}
            onChange={(value) =>
            setFormData({
              ...formData,
              category: value
            })
            }
            placeholder="Select category..." />

        </div>

        {/* Preview */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Preview
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200 min-h-[80px]">
              <p className="text-xs text-slate-400 mb-1">Front</p>
              <p className="text-sm text-slate-700">
                {formData.front || 'Your question will appear here...'}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 min-h-[80px]">
              <p className="text-xs text-slate-400 mb-1">Back</p>
              <p className="text-sm text-slate-100">
                {formData.back || 'Your answer will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>);

}