import React from 'react';

export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Max score is 6, map to standard 4 levels
  const scoreMap = [
    { label: 'Very Weak', color: 'bg-red-500', width: 'w-1/6' }, // 0-1
    { label: 'Weak', color: 'bg-red-400', width: 'w-2/6' },      // 2
    { label: 'Weak', color: 'bg-red-400', width: 'w-3/6' },      // 3
    { label: 'Fair', color: 'bg-yellow-500', width: 'w-4/6' },   // 4
    { label: 'Good', color: 'bg-blue-500', width: 'w-5/6' },     // 5
    { label: 'Strong', color: 'bg-green-500', width: 'w-full' }  // 6
  ];

  const index = Math.min(score, 5);
  return {
    score,
    ...scoreMap[index]
  };
};

export const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const { label, color, width } = checkPasswordStrength(password);

  return (
    <div className="flex flex-col gap-1.5 text-left mt-2">
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        <span>Password Strength</span>
        <span className="font-extrabold">{label}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} ${width} transition-all duration-350`} />
      </div>
    </div>
  );
};
