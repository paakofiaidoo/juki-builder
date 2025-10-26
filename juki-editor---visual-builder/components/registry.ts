import React from 'react';

// FIX: Replaced JSX with React.createElement to be compatible with a .ts file.
// This resolves multiple parsing errors by avoiding JSX syntax.
// Also updated to handle `children` props for cases where elements are nested.
const Button: React.FC<any> = ({ className, text, children, ...props }) => {
  return React.createElement('button', { className, ...props }, text || children || 'Button');
};

// FIX: Replaced JSX with React.createElement to be compatible with a .ts file.
// This resolves multiple parsing errors.
const Card: React.FC<any> = ({ className, children, ...props }) => (
    React.createElement('div', { className, ...props }, children)
);

// FIX: Replaced JSX with React.createElement to be compatible with a .ts file.
// This resolves multiple parsing errors.
const Input: React.FC<any> = ({ className, ...props }) => (
    React.createElement('input', { className, ...props })
);

export const componentRegistry: Record<string, React.FC<any>> = {
  Button,
  Card,
  Input,
};
