import { SwapSuccessData } from "./SwapCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Copy, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SuccessScreenProps {
  data: SwapSuccessData;
  onNewSwap: () => void;
}

export const SuccessScreen = ({ data, onNewSwap }: SuccessScreenProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass rounded-3xl p-8 card-shadow animate-scale-in text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Swap Successful!</h2>
        <p className="text-muted-foreground mb-8">
          Your transaction has been confirmed
        </p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <img
              src={data.fromToken.icon}
              alt={data.fromToken.symbol}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${data.fromToken.symbol}&background=random`;
              }}
            />
            <div className="text-left">
              <div className="font-semibold">{data.fromAmount}</div>
              <div className="text-sm text-muted-foreground">
                {data.fromToken.symbol}
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <img
              src={data.toToken.icon}
              alt={data.toToken.symbol}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${data.toToken.symbol}&background=random`;
              }}
            />
            <div className="text-left">
              <div className="font-semibold">{parseFloat(data.toAmount).toFixed(4)}</div>
              <div className="text-sm text-muted-foreground">
                {data.toToken.symbol}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-left bg-secondary/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{formatDate(data.date)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">From Address</span>
            <button
              onClick={() => copyToClipboard(data.fromAddress, "Address")}
              className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
            >
              {data.fromAddress.slice(0, 8)}...{data.fromAddress.slice(-6)}
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Transaction Hash</span>
            <button
              onClick={() => copyToClipboard(data.txHash, "Transaction hash")}
              className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
            >
              {data.txHash.slice(0, 8)}...{data.txHash.slice(-6)}
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              window.open(`${data.blockExplorerUrl}${data.txHash}`, "_blank")
            }
          >
            <ExternalLink className="w-4 h-4" />
            View on Block Explorer
          </Button>

          <Button variant="gradient" size="lg" className="w-full" onClick={onNewSwap}>
            New Swap
          </Button>
        </div>
      </div>
    </div>
  );
};
