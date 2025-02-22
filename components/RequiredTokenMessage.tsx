import React from 'react';

interface RequiredTokenMessageProps {
  tokenSymbol?: string | null;
  requiredTokens?: string | null;
  image?: string | null;
  variant?: 'orange' | 'green';
  balance?: string | null;
}

export function RequiredTokenMessage({
  tokenSymbol = '',
  requiredTokens = '0',
  image,
  variant = 'orange',
  balance,
}: RequiredTokenMessageProps) {
  const colorClasses = {
    orange: 'text-orange-700 bg-orange-50',
    green: 'text-green-700 bg-green-50',
  };

  const iconClasses = {
    orange: 'text-orange-600',
    green: 'text-green-600',
  };

  return (
    <div className="flex items-center justify-center gap-3 mb-3">
      {image && (
        <img
          src={image}
          alt={`${tokenSymbol} token`}
          className="w-6 h-6 rounded-full"
        />
      )}
      <div className={`inline-flex items-center justify-center gap-2 text-sm ${colorClasses[variant]} px-3 py-1.5 rounded-full`}>
        {variant === 'orange' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`w-4 h-4 ${iconClasses[variant]}`}>
            <path
              fillRule="evenodd"
              d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`w-4 h-4 ${iconClasses[variant]}`}>
            <path
              fillRule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === 'orange' ? (
          <>You need {requiredTokens} ${tokenSymbol} to access</>
        ) : (
          <>
            Access Verified
            {balance && `. You own ${balance} ${tokenSymbol}`}
          </>
        )}
      </div>
    </div>
  );
} 