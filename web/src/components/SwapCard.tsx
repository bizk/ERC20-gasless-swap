import { useState, useEffect } from "react";
import { Token } from "@/data/tokens";
import { TokenInput } from "./TokenInput";
import { TokenSelectModal } from "./TokenSelectModal";
import { ConnectWalletModal } from "./ConnectWalletModal";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Fuel, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SwapCardProps {
  onSwapSuccess: (data: SwapSuccessData) => void;
}

export interface SwapSuccessData {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  blockExplorerUrl: string;
  date: Date;
}

export const SwapCard = ({ onSwapSuccess }: SwapCardProps) => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [selectingFor, setSelectingFor] = useState<"from" | "to" | null>(null);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const FEE_PERCENTAGE = 0.3;

  // Calculate output amount based on token prices
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      const inputValue = parseFloat(fromAmount) * fromToken.price;
      const outputAmount = inputValue / toToken.price;
      const afterFee = outputAmount * (1 - FEE_PERCENTAGE / 100);
      setToAmount(afterFee.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const getFeeAmount = () => {
    if (!fromToken || !fromAmount || parseFloat(fromAmount) <= 0) return null;
    const fee = (parseFloat(fromAmount) * fromToken.price * FEE_PERCENTAGE) / 100;
    return fee.toFixed(2);
  };

  const getUsdValue = (token: Token | null, amount: string) => {
    if (!token || !amount || parseFloat(amount) <= 0) return undefined;
    return (parseFloat(amount) * token.price).toFixed(2);
  };

  const handleContinue = () => {
    if (!walletAddress) {
      setShowConnectWallet(true);
      return;
    }
    handleSign();
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    // In production, this would use window.ethereum
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock wallet address
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD42";
    setWalletAddress(mockAddress);
    setIsConnecting(false);
    setShowConnectWallet(false);
    
    toast({
      title: "Wallet Connected",
      description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
    });
  };

  const handleSign = async () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) return;
    
    setIsSigning(true);
    
    // PLACEHOLDER: Contract signing call would go here
    // In production, this would interact with the smart contract
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock success response
    const successData: SwapSuccessData = {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      fromAddress: walletAddress!,
      toAddress: walletAddress!,
      txHash: "0x" + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(""),
      blockExplorerUrl: "https://etherscan.io/tx/",
      date: new Date(),
    };
    
    setIsSigning(false);
    onSwapSuccess(successData);
  };

  const isValidSwap =
    fromToken &&
    toToken &&
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    toAmount;

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="glass rounded-3xl p-6 card-shadow animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Swap</h2>
            {walletAddress && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            )}
          </div>

          <div className="space-y-2 relative">
            <TokenInput
              label="You pay"
              token={fromToken}
              amount={fromAmount}
              onAmountChange={setFromAmount}
              onTokenSelect={() => setSelectingFor("from")}
              usdValue={getUsdValue(fromToken, fromAmount)}
            />

            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(50%-16px)] z-10">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-xl border-4 border-background hover:rotate-180 transition-transform duration-300"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="w-4 h-4" />
              </Button>
            </div>

            <TokenInput
              label="You receive"
              token={toToken}
              amount={toAmount}
              onTokenSelect={() => setSelectingFor("to")}
              readOnly
              usdValue={getUsdValue(toToken, toAmount)}
            />
          </div>

          {isValidSwap && (
            <div className="mt-4 p-4 rounded-xl bg-secondary/30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Fuel className="w-4 h-4" />
                  Network Fee ({FEE_PERCENTAGE}%)
                </span>
                <span className="font-medium">${getFeeAmount()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Info className="w-4 h-4" />
                  Rate
                </span>
                <span className="font-medium">
                  1 {fromToken?.symbol} = {(fromToken!.price / toToken!.price).toFixed(4)} {toToken?.symbol}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="gradient"
            size="xl"
            className="w-full mt-6"
            disabled={!isValidSwap || isSigning}
            onClick={handleContinue}
          >
            {isSigning ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing Transaction...
              </span>
            ) : !fromToken || !toToken ? (
              "Select tokens"
            ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
              "Enter amount"
            ) : !walletAddress ? (
              "Connect Wallet"
            ) : (
              "Swap"
            )}
          </Button>
        </div>
      </div>

      <TokenSelectModal
        open={selectingFor !== null}
        onClose={() => setSelectingFor(null)}
        onSelect={(token) => {
          if (selectingFor === "from") {
            setFromToken(token);
          } else {
            setToToken(token);
          }
        }}
        excludeToken={selectingFor === "from" ? toToken : fromToken}
      />

      <ConnectWalletModal
        open={showConnectWallet}
        onClose={() => setShowConnectWallet(false)}
        onConnect={handleConnectWallet}
        isConnecting={isConnecting}
      />
    </>
  );
};
