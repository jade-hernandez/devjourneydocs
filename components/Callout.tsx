import React from "react";

type CalloutType = "info" | "warning" | "error" | "tip";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  emoji?: string;
}

const typeStyles: Record<CalloutType, string> = {
  info: "bg-blue-100 border-blue-500 text-blue-900",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-900",
  error: "bg-red-100 border-red-500 text-red-900",
  tip: "bg-green-100 border-green-500 text-green-900"
};

const Callout: React.FC<CalloutProps> = ({
  children,
  type = "info",
  emoji
}) => {
  return (
    <div className={`p-4 my-4 border-l-4 ${typeStyles[type]}`}>
      <div className='flex items-center'>
        {emoji && <span className='text-2xl mr-2'>{emoji}</span>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Callout;
