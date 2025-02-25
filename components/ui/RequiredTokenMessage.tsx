interface RequiredTokenMessageProps {
  amount?: string | null;
  symbol?: string | null;
}

export function RequiredTokenMessage({ amount = "0", symbol = "" }: RequiredTokenMessageProps) {
  return (
    <div className="inline-flex items-center justify-center gap-2 text-sm text-orange-700 px-3 py-1.5 rounded-full mx-auto">
      You need to hold {amount} ${symbol} to access this link.
    </div>
  );
} 