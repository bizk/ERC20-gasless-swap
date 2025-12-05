import { useState } from "react";
import { Token, tokens } from "@/data/tokens";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TokenSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token | null;
}

export const TokenSelectModal = ({
  open,
  onClose,
  onSelect,
  excludeToken,
}: TokenSelectModalProps) => {
  const [search, setSearch] = useState("");

  const filteredTokens = tokens.filter(
    (token) =>
      token !== excludeToken &&
      (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Select a token</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or symbol"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
          />
        </div>
        <div className="mt-4 space-y-1 max-h-80 overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => handleSelect(token)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/80 transition-colors group"
            >
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                }}
              />
              <div className="flex-1 text-left">
                <div className="font-semibold group-hover:text-primary transition-colors">
                  {token.symbol}
                </div>
                <div className="text-sm text-muted-foreground">{token.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  ${token.price.toLocaleString()}
                </div>
              </div>
            </button>
          ))}
          {filteredTokens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tokens found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
