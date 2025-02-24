import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from './Spinner';

type TokenMetadata = {
  name: string;
  description?: string;
  symbol?: string;
  image?: string;
  attributes?: any[];
};

interface TokenSelectorProps {
  selectedToken: string | null;
  onTokenSelect: (tokenAddress: string | null) => void;
  onMetadataLoad?: (metadata: TokenMetadata | null) => void;
}

export default function TokenSelector({ 
  selectedToken, 
  onTokenSelect,
  onMetadataLoad
}: TokenSelectorProps) {
  const [inputValue, setInputValue] = useState(selectedToken || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      return "Asset address is required";
    }
    if (address.length !== 44) {
      return "Invalid Solana address format (must be 44 characters)";
    }
    return null;
  };

  const fetchTokenMetadata = async (address: string) => {
    const validationError = validateAddress(address);
    if (validationError) {
      setError(validationError);
      onMetadataLoad?.(null);
      onTokenSelect(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/token-metadata?address=${address}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch asset data');
      }

      if (data.metadata) {
        onMetadataLoad?.(data.metadata);
        onTokenSelect(address);
      } else {
        throw new Error('No asset metadata found');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch asset metadata';
      setError(message);
      onMetadataLoad?.(null);
      onTokenSelect(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    await fetchTokenMetadata(inputValue.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null); // Clear error when input changes
          }}
          placeholder="Enter asset address (44 characters)"
          className="flex-1 font-mono text-sm"
          maxLength={44}
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
          {isLoading ? <Spinner className="h-4 w-4" /> : 'Load'}
        </Button>
      </form>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Enter a valid Solana asset address to load its metadata
      </p>
    </div>
  );
} 