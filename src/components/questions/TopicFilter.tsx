import React from 'react';
import { Select } from '../ui/Select';
interface TopicFilterProps {
  selectedTopic: string;
  onChange: (topic: string) => void;
}
export function TopicFilter({
  selectedTopic,
  onChange
}: TopicFilterProps) {
  const topics = [{
    value: 'all',
    label: 'All Topics'
  }, {
    value: 'general',
    label: 'General Psychology'
  }, {
    value: 'abnormal',
    label: 'Abnormal Psychology'
  }, {
    value: 'assessment',
    label: 'Psychological Assessment'
  }, {
    value: 'industrial',
    label: 'Industrial/Org Psychology'
  }, {
    value: 'ethics',
    label: 'Ethics (RA 10029)'
  }];
  return <div className="w-full sm:w-64">
      <Select options={topics} value={selectedTopic} onChange={onChange} placeholder="Filter by Topic" />
    </div>;
}