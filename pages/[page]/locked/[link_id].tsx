import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const LockedPage: React.FC<{
  hasAccess: boolean;
  gatedUrl: string;
  pageData: any;
  linkItem: any;
}> = ({ hasAccess, gatedUrl, pageData, linkItem }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(hasAccess);
  const [gatedUrl, setGatedUrl] = useState(gatedUrl);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const { toast } = useToast();

  // Track link clicks
  const trackClick = async (isGated: boolean) => {
    // ... existing code ...
    const { hasAccess: newHasAccess, balance } = await response.json();
    
    console.log('Token verification result:', {
      tokenAddress: pageData.connectedToken,
      requiredAmount: linkItem.requiredTokens[0],
      balance,
      hasAccess: newHasAccess
    });

    setHasAccess(newHasAccess);
    setTokenBalance(balance);
    if (newHasAccess && linkItem.url) {
      setGatedUrl(linkItem.url);
    }
  };

  return (
    <div>
      {/* ... existing code ... */}
      <div className="inline-flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full mx-auto mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4 text-green-600">
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
        Access Verified. You own {tokenBalance || linkItem.requiredTokens[0]} ${pageData.tokenSymbol}
      </div>
      {!hasAccess && (
        <>
          <div className="inline-flex items-center justify-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 text-orange-600">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            You need {linkItem.requiredTokens?.[0] || "0"} ${pageData.tokenSymbol} to access
          </div>
          <Button onClick={() => {}} className="w-full">
            Connect Wallet
          </Button>
        </>
      )}
    </div>
  );
};

export default LockedPage; 