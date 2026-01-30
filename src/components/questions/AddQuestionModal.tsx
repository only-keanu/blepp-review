import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, Trash2 } from 'lucide-react';
import { Question } from '../../types';
interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
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
}];

const DIFFICULTIES = [
{
  value: 'easy',
  label: 'Easy'
},
{
  value: 'medium',
  label: 'Medium'
},
{
  value: 'hard',
  label: 'Hard'
},
{
  value: 'difficult',
  label: 'Difficult'
}];

const CATEGORIES = [
{
  value: 'theories',
  label: 'Theories & Concepts'
},
{
  value: 'disorders',
  label: 'Disorders & Conditions'
},
{
  value: 'assessment',
  label: 'Assessment & Testing'
},
{
  value: 'research',
  label: 'Research Methods'
},
{
  value: 'ethics',
  label: 'Ethics & Law'
},
{
  value: 'development',
  label: 'Development'
},
{
  value: 'biological',
  label: 'Biological Bases'
},
{
  value: 'social',
  label: 'Social Psychology'
},
{
  value: 'cognitive',
  label: 'Cognitive Processes'
},
{
  value: 'other',
  label: 'Other'
}];

export function AddQuestionModal({
  isOpen,
  onClose,
  onSave
}: AddQuestionModalProps) {
  const [formData, setFormData] = useState({
    text: '',
    choices: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    topicId: '',
    difficulty: 'medium' as Question['difficulty'],
    category: '',
    tags: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({
      ...formData,
      choices: newChoices
    });
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
    }
    if (!formData.topicId) {
      newErrors.topicId = 'Please select a topic';
    }
    if (formData.choices.some((c) => !c.trim())) {
      newErrors.choices = 'All choices must be filled';
    }
    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Explanation is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    const newQuestion: Question = {
      id: `manual_${Date.now()}`,
      text: formData.text,
      choices: formData.choices,
      correctAnswerIndex: formData.correctAnswerIndex,
      explanation: formData.explanation,
      topicId: formData.topicId,
      difficulty: formData.difficulty,
      source: 'manual',
      category: formData.category,
      tags: formData.tags.
      split(',').
      map((t) => t.trim()).
      filter(Boolean),
      createdAt: new Date().toISOString()
    };
    onSave(newQuestion);
    handleReset();
    onClose();
  };
  const handleReset = () => {
    setFormData({
      text: '',
      choices: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      topicId: '',
      difficulty: 'medium',
      category: '',
      tags: ''
    });
    setErrors({});
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Question"
      size="lg"
      footer={
      <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Question</Button>
        </>
      }>

      <div className="space-y-5">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border ${errors.text ? 'border-red-300' : 'border-slate-300'} shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 text-sm min-h-[100px]`}
            placeholder="Enter your question here..."
            value={formData.text}
            onChange={(e) =>
            setFormData({
              ...formData,
              text: e.target.value
            })
            } />

          {errors.text &&
          <p className="mt-1 text-sm text-red-600">{errors.text}</p>
          }
        </div>

        {/* Topic and Difficulty Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Topic"
            options={TOPICS}
            value={formData.topicId}
            onChange={(value) =>
            setFormData({
              ...formData,
              topicId: value
            })
            }
            placeholder="Select topic..." />

          <Select
            label="Difficulty"
            options={DIFFICULTIES}
            value={formData.difficulty}
            onChange={(value) =>
            setFormData({
              ...formData,
              difficulty: value as Question['difficulty']
            })
            } />

        </div>

        {/* Category */}
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
          placeholder="Select category..."
          searchable />


        {/* Answer Choices */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Answer Choices <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {formData.choices.map((choice, index) =>
            <div key={index} className="flex items-center gap-3">
                <button
                type="button"
                onClick={() =>
                setFormData({
                  ...formData,
                  correctAnswerIndex: index
                })
                }
                className={`
                    h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${formData.correctAnswerIndex === index ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-slate-500 hover:border-green-300'}
                  `}
                title={
                formData.correctAnswerIndex === index ?
                'Correct answer' :
                'Mark as correct'
                }>

                  {String.fromCharCode(65 + index)}
                </button>
                <input
                type="text"
                className="flex-1 rounded-lg border border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 text-sm"
                placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)} />

              </div>
            )}
          </div>
          {errors.choices &&
          <p className="mt-1 text-sm text-red-600">{errors.choices}</p>
          }
          <p className="mt-2 text-xs text-slate-500">
            Click the letter to mark the correct answer (currently:{' '}
            {String.fromCharCode(65 + formData.correctAnswerIndex)})
          </p>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Explanation <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full rounded-lg border ${errors.explanation ? 'border-red-300' : 'border-slate-300'} shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 text-sm min-h-[80px]`}
            placeholder="Explain why this is the correct answer..."
            value={formData.explanation}
            onChange={(e) =>
            setFormData({
              ...formData,
              explanation: e.target.value
            })
            } />

          {errors.explanation &&
          <p className="mt-1 text-sm text-red-600">{errors.explanation}</p>
          }
        </div>

        {/* Tags */}
        <Input
          label="Tags (Optional)"
          placeholder="Enter tags separated by commas (e.g., freud, defense mechanisms)"
          value={formData.tags}
          onChange={(e) =>
          setFormData({
            ...formData,
            tags: e.target.value
          })
          }
          helperText="Tags help organize and find questions later" />

      </div>
    </Modal>);

}