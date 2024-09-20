import React from "react";

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completed,
  total
}) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className='mt-4'>
      <div className='flex justify-between mb-1'>
        <span className='text-base font-medium text-blue-700 dark:text-white'>
          Learning Progress
        </span>
        <span className='text-sm font-medium text-blue-700 dark:text-white'>
          {percentage}%
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
        <div
          className='bg-blue-600 h-2.5 rounded-full'
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className='text-sm text-gray-500 mt-1'>
        {completed} of {total} topics completed
      </div>
    </div>
  );
};

export default ProgressTracker;
