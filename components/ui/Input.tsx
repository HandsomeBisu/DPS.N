import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-ios-gray ml-3">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-ios-card text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-transparent focus:border-ios-blue/50 focus:ring-2 focus:ring-ios-blue/20 outline-none transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-ios-red text-xs ml-3 animate-slide-up">{error}</p>
      )}
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full space-y-1.5">
       {label && (
        <label className="block text-xs font-medium text-ios-gray ml-3">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-ios-card text-white placeholder-gray-500 rounded-xl px-4 py-3 border border-transparent focus:border-ios-blue/50 focus:ring-2 focus:ring-ios-blue/20 outline-none transition-all duration-200 resize-none ${className}`}
        {...props}
      />
    </div>
  )
}