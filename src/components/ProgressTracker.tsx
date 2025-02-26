"use client";

import React from "react";

interface ProgressTrackerProps {
  section: number;
  completedTasks: number;
  totalTasks: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  section,
  completedTasks,
  totalTasks
}) => {
  const percentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className='progress-tracker'>
      <h3>Section {section} Progress</h3>
      <div className='progress-bar'>
        <div
          className='progress'
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p>
        {completedTasks} of {totalTasks} tasks completed ({percentage}%)
      </p>
    </div>
  );
};

