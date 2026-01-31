import React from 'react';
import { Select } from '../ui/Select';
import { Topic } from '../../types';
interface TopicFilterProps {
  selectedTopic: string;
  onChange: (topic: string) => void;
  topics: Topic[];
}
export function TopicFilter({ selectedTopic, onChange, topics }: TopicFilterProps) {
  const options = [
  {
    value: 'all',
    label: 'All Topics'
  },
  ...topics.map((topic) => ({
    value: topic.id,
    label: topic.name
  }))];

  return (
    <div className="w-full sm:w-64">
      <Select
        options={options}
        value={selectedTopic}
        onChange={onChange}
        placeholder="Filter by Topic" />

    </div>);

}
