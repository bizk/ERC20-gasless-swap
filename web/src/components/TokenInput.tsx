import { Token } from "@/data/tokens";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface TokenInputProps {
  label: string;
  token: Token | null;
  amount: string;
  onAmountChange?: (value: string) => void;
  onTokenSelect: () => void;
  readOnly?: boolean;
  usdValue?: string;
}

export const TokenInput = ({
  label,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  readOnly = false,
  usdValue,
}: TokenInputProps) => {
  return (
    <div className="glass rounded-2xl p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {usdValue && (
          <span className="text-sm text-muted-foreground">${usdValue}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          placeholder="0.0"
          readOnly={readOnly}
          className={`flex-1 bg-transparent text-3xl font-semibold text-foreground placeholder:text-muted-foreground/50 outline-none ${
            readOnly ? "cursor-default" : ""
          }`}
        />
        <Button
          variant="token"
          onClick={onTokenSelect}
          className="flex items-center gap-2 px-3 py-2 h-auto"
        >
          {token ? (
            <>
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                }}
              />
              <span className="font-semibold">{token.symbol}</span>
            </>
          ) : (
            <span className="font-medium">Select</span>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
