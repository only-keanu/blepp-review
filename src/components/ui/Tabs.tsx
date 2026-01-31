import React, { useEffect, useState, useRef } from 'react';
interface Tab {
  id: string;
  label: string;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}
export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0
  });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeElement = tabsRef.current[activeIndex];
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth
      });
    }
  }, [activeTab, tabs]);
  return (
    <div className={`relative border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) =>
        <button
          key={tab.id}
          ref={(el) => tabsRef.current[index] = el}
          onClick={() => onChange(tab.id)}
          className={`
              whitespace-nowrap py-4 px-1 text-sm font-medium transition-colors focus:outline-none
              ${activeTab === tab.id ? 'text-teal-600 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
            `}>

            {tab.label}
          </button>
        )}
      </div>
      <div
        className="absolute bottom-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width
        }} />

    </div>);

}
