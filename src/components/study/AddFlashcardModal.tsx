import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Flashcard, Topic } from '../../types';
interface AddFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  onSave: (payload: FlashcardCreatePayload) => Promise<void>;
  initial?: {
    id?: string;
    front?: string;
    back?: string;
    topicId?: string;
    category?: string;
  };
}
interface FlashcardCreatePayload {
  front: string;
  back: string;
  topicId: string;
  category?: string;
}

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
  onSave,
  topics,
  initial
}: AddFlashcardModalProps) {
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    topicId: '',
    category: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const isEditMode = Boolean(initial?.id);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        front: initial?.front || '',
        back: initial?.back || '',
        topicId: initial?.topicId || '',
        category: initial?.category || ''
      });
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, initial]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.front.trim()) {
      newErrors.front = 'Front side is required';
    }
    if (!formData.back.trim()) {
      newErrors.back = 'Back side is required';
    }
    if (!formData.topicId) {
      newErrors.topic = 'Please select a topic';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitError('');
    try {
      await onSave({
        front: formData.front,
        back: formData.back,
        topicId: formData.topicId,
        category: formData.category || undefined
      });
      handleReset();
      onClose();
    } catch (err) {
      setSubmitError('Failed to save flashcard. Please try again.');
    }
  };
  const handleReset = () => {
    setFormData({
      front: '',
      back: '',
      topicId: '',
      category: ''
    });
    setErrors({});
    setSubmitError('');
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Flashcard" : "Create New Flashcard"}
      size="md"
      footer={
      <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? 'Save Changes' : 'Save Flashcard'}
          </Button>
        </>
      }>

      <div className="space-y-5">
        {/* Front Side */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Front Side (Question/Term) <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border ${errors.front ? 'border-red-300' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 text-sm min-h-[100px]`}
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Back Side (Answer/Definition){' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border ${errors.back ? 'border-red-300' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 text-sm min-h-[100px]`}
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
            options={topics.map((topic) => ({
              value: topic.id,
              label: topic.name
            }))}
            value={formData.topicId}
            onChange={(value) =>
            setFormData({
              ...formData,
              topicId: value
            })
            }
            placeholder="Select topic..."
            searchable
            disabled={isEditMode} />

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

        {submitError &&
        <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-200">
            {submitError}
          </div>
        }

        {/* Preview */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Preview
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 min-h-[80px]">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Front</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {formData.front || 'Your question will appear here...'}
              </p>
            </div>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 min-h-[80px]">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Back</p>
              <p className="text-sm text-slate-100">
                {formData.back || 'Your answer will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>);

}
