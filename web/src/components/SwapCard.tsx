 // @ts-expect-error TS2589 
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Token, tokens } from "@/data/tokens";
import { TokenInput } from "./TokenInput";
import { TokenSelectModal } from "./TokenSelectModal";
import { ConnectWalletModal } from "./ConnectWalletModal";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Fuel, Info, CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

import { createPublicClient, Hex, http } from 'viem'
import { mainnet } from 'viem/chains'
import {  entryPoint07Address } from 'viem/account-abstraction'
import { createSmartAccountClient } from "permissionless";

import { 
  Implementation, 
  toMetaMaskSmartAccount, 
} from "@metamask/smart-accounts-kit"

import { privateKeyToAccount } from "viem/accounts";

import { useAccount, useConnect, useDisconnect, useWalletClient, usePublicClient } from "wagmi";
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { prepareUserOperationForErc20Paymaster } from 'permissionless/experimental/pimlico';
import { buildGaslessUniswapCall, buildSmartAccount, ETH_TOKEN, USDC_TOKEN } from "@/lib/swap";
import { getApprovalData, getSwapData } from "@/lib/dex";

// import * as wagmiPermit from "wagmi-permit";

export interface QuotationResponse {
  gasPrice: number;
  to: string;
  data: string;
  value: string;
}

export const SwapCard = ({ onSwapSuccess }: SwapCardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [selectingFor, setSelectingFor] = useState<"from" | "to" | null>(null);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConnectingWallet, setShowConnectingWallet] = useState(false);
  const [pendingSwapAfterConnect, setPendingSwapAfterConnect] = useState(false);
  const [swapResult, setSwapResult] = useState<{
    txHash: string;
    fromAddress: string;
    toAddress: string;
    fee: string;
    explorerUrl: string;
  } | null>(null);

  const FEE_PERCENTAGE = 0.3;

  useEffect(() => {
    const ethToken = tokens.find((token) => token.symbol === "ETH");
    const usdcToken = tokens.find((token) => token.symbol === "USDC");
    
    if (ethToken) {
      setFromToken((prev) => prev || ethToken);
    }
    if (usdcToken) {
      setToToken((prev) => prev || usdcToken);
    }
    setFromAmount((prev) => prev || "0.0001");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store selected coin in URL params
  useEffect(() => {
    if (fromToken) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("fromToken", fromToken.address);
        return newParams;
      });
    }
  }, [fromToken, setSearchParams]);

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

  // TODO call the backend to get the exchange rate of such TX
  const getUsdValue = (token: Token | null, amount: string) => {
    if (!token || !amount || parseFloat(amount) <= 0) return undefined;
    return (parseFloat(amount) * token.price).toFixed(2);
  };

  // Handle swap button click
  const handleSwap = async () => {
    if (!isConnected) {
      // Show connecting modal and connect wallet
      setShowConnectingWallet(true);
      setPendingSwapAfterConnect(true);
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      }
      return;
    }
    
    // Wallet is connected, proceed with swap
    setIsProcessing(true);
    try {
      const result = await smartaccountSwap();
      if (result) {
        setSwapResult(result);
        setShowSuccessDialog(true);
      }
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: error instanceof Error ? error.message : "An error occurred during the swap.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  // TODO Connect wallet to metamask
  const client = usePublicClient()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

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

  // TODO sign tx 
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

  useEffect(() => {
    if (isValidSwap) {
      console.log("get quotation");
    }
  }, [isValidSwap]);

    // METAMASK data
  const { data: walletClient } = useWalletClient(); // Signer 
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && pendingSwapAfterConnect && showConnectingWallet) {
      setShowConnectingWallet(false);
      setPendingSwapAfterConnect(false);
      setTimeout(() => {
        setIsProcessing(true);
        smartaccountSwap()
          .then((result) => {
            if (result) {
              setSwapResult(result);
              setShowSuccessDialog(true);
            }
          })
          .catch((error) => {
            toast({
              title: "Swap Failed",
              description: error instanceof Error ? error.message : "An error occurred during the swap.",
              variant: "destructive",
            });
          })
          .finally(() => {
            setIsProcessing(false);
          });
      }, 2000);
    }
  }, [isConnected, pendingSwapAfterConnect, showConnectingWallet]);

  const smartaccountSwap = async (): Promise<{
    txHash: string;
    fromAddress: string;
    toAddress: string;
    fee: string;
    explorerUrl: string;
  } | null> => {
    try {
      console.log("Starting swap...") // MEssage to screen here

      // We would need to adapt the urls and http to adapt to the network
      const pimlicoUrl = `https://api.pimlico.io/v2/1/rpc?apikey=${import.meta.env.VITE_PIMLICO_API_KEY}`
  
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http("https://eth.blockrazor.xyz"),
      });
       
      const paymasterClient = createPimlicoClient({
        transport: http(pimlicoUrl),
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      });
  
      const ownerAddress = address as Hex;
      
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [ownerAddress, [], [], []],
        deploySalt: "0x",
        signer: { walletClient },
      })
  
      console.log("[dApp] Owner address: " + ownerAddress)
      console.log("[dApp] Smart account address: https://etherscan.io/address/" + smartAccount?.address)
      // Message: Creating swap in smart account https://etherscan.io/address/" + smartAccount?.address (Original wallet owneraddress)
      
      const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        chain: mainnet,
        paymaster: paymasterClient,
        bundlerTransport: http(
          pimlicoUrl,
        ),
        userOperation: {
          estimateFeesPerGas: async () =>
            (await paymasterClient.getUserOperationGasPrice()).fast,
            prepareUserOperation: prepareUserOperationForErc20Paymaster(paymasterClient),
        },
      });
  
      // const approvalData = await getApprovalData(fromToken?.address, fromAmount);
      // console.log("[dApp] Approval operation data:", JSON.stringify(approvalData, null, 2));
  
      // // TODO study why value is 0n
      // const approvalOpHash = await smartAccountClient.sendUserOperation({
      //   account: smartAccount,
      //   calls: [{
      //     to: approvalData?.to as Hex,
      //     data: approvalData?.data as Hex,
      //     value: 0n // since it is a swap in the mainnet we use 0n 
      //   }]
      // })
      // console.log("[dApp] Approval user operation hash:", approvalOpHash)
  
      // const approvalReceipt = await smartAccountClient.waitForUserOperationReceipt({ hash: approvalOpHash });
      // console.log("[dApp] Approval receipt:", approvalReceipt)
   
      // ERC-20 permit
      // const permitCalldata = await buildPermitCalldataWithViem({
      //   client,
      //   walletClient,
      //   token: fromToken,
      //   owner: ownerAddress,
      //   spender: ownerAddress,
      //   value: parseEther(fromAmount, "gwei"),
      //   chainId: mainnet.id,
      // });
      
      // console.log("[dApp] Permit calldata:", permitCalldata)
      // From = smart account address |
      const swapResponse = await getSwapData(smartAccount.address, fromToken?.address, toToken?.address, fromAmount);
      console.log("[dApp] Swap response:", JSON.stringify(swapResponse, null, 2));

      // Message: Processing swap
      const swapHash = await smartAccountClient.sendUserOperation({
        account: smartAccount,
        calls: [{
          to: swapResponse?.tx.to as Hex,
          data: swapResponse?.tx.data as Hex,
          value: swapResponse?.tx.value as bigint,
        }]
      })

      console.log("[dApp] Swap user operation hash:", swapHash)
  
      const swapReceipt = await smartAccountClient.waitForUserOperationReceipt({ hash: swapHash });
      console.log("[dApp] Swap receipt:", swapReceipt)
      
      
      return {
        txHash: swapResponse?.txHash || "",
        fromAddress: address,
        toAddress: address, // TODO: Replace with actual recipient address
        fee: swapResponse?.fee || "0",
        explorerUrl: `https://etherscan.io/tx/${swapResponse}`,
      };
    } catch (error) {
      console.error("[dApp] Error swapping:", error);
      return null;
    }
  }

  const delegationSwap = async (): Promise<{
    txHash: string;
    fromAddress: string;
    toAddress: string;
    fee: string;
    explorerUrl: string;
  } | null> => {
    console.log("INCH SWAP")

    // We would need to adapt the urls and http to adapt to the network
    const pimlicoUrl = `https://api.pimlico.io/v2/1/rpc?apikey=${import.meta.env.VITE_PIMLICO_API_KEY}`

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http("https://eth.blockrazor.xyz"),
    });
     
    const paymasterClient = createPimlicoClient({
      transport: http(pimlicoUrl),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    });

    const delegatorAccount = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY as Hex);

    const delegatorSmartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [delegatorAccount.address, [], [], []],
      deploySalt: "0x",
      signer: { account: delegatorAccount },
    })

    console.log("DELEGATOR SMART ACCOUNT: https://etherscan.io/address/" + delegatorSmartAccount?.address)
    
    const smartAccountClient = createSmartAccountClient({
      account: delegatorSmartAccount,
      chain: mainnet,
      paymaster: paymasterClient,
      bundlerTransport: http(
        pimlicoUrl,
      ),
      userOperation: {
        estimateFeesPerGas: async () =>
          (await paymasterClient.getUserOperationGasPrice()).fast,
        prepareUserOperation: prepareUserOperationForErc20Paymaster(paymasterClient),
      },
    });

    const approvalData = await getApprovalData(toToken?.address, fromAmount);
    console.log("[dApp] Approval operation data:", JSON.stringify(approvalData, null, 2));

    // TODO study why value is 0n
    // const approvalOpHash = await smartAccountClient.sendUserOperation({
    //   account: delegatorSmartAccount,
    //   calls: [{
    //     to: approvalData?.to as Hex,
    //     data: approvalData?.data as Hex,
    //     value: 0n // since it is a swap in the mainnet we use 0n 
    //   }]
    // })
    // console.log("[dApp] Approval user operation hash:", approvalOpHash)

    // const approvalReceipt = await smartAccountClient.waitForUserOperationReceipt({ hash: approvalOpHash });
    // console.log("[dApp] Approval receipt:", approvalReceipt)
 
    // From = smart account address |
    const swapResponse = await getSwapData(delegatorSmartAccount.address, fromToken?.address, toToken?.address, fromAmount);
    console.log("[dApp] Swap response:", JSON.stringify(swapResponse, null, 2));

    // const { to: swapTo, data: swapData, value: swapValue } = swapResponse.data.tx;
    // console.log("SWAP TO", swapTo)
    // console.log("SWAP DATA", swapData)
    // console.log("SWAP VALUE", swapValue)

    // const swapHash = await smartAccountClient.sendUserOperation({
    //   account: delegatorSmartAccount,
    //   calls: [{
    //     to: swapTo as Hex,
    //     data: swapData as Hex,
    //     value: swapValue as bigint,
    //   }]
    // })

    // console.log("SWAP HASH", swapHash)

    // const swapReceipt = await smartAccountClient.waitForUserOperationReceipt({ hash: swapHash });
    // console.log("Swap receipt", swapReceipt)
    
    // TODO: Replace with actual transaction data from swapReceipt
    // For now, return mock data structure
    if (!address || !fromToken || !fromAmount) {
      return null;
    }

    const feeAmount = getFeeAmount() || "0";
    const txHash = "0x" + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    
    return {
      txHash,
      fromAddress: address,
      toAddress: address, // TODO: Replace with actual recipient address
      fee: feeAmount,
      explorerUrl: `https://etherscan.io/tx/${txHash}`,
    };
  }

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
            disabled={!isValidSwap || isSigning || isProcessing}
            onClick={handleSwap}
          >
            {isSigning || isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </span>
            ) : !fromToken || !toToken ? (
              "Select tokens"
            ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
              "Enter amount"
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

      <Dialog open={showConnectingWallet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connecting to Wallet</DialogTitle>
            <DialogDescription>
              Please approve the connection request in your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConnectingWallet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connecting to Wallet</DialogTitle>
            <DialogDescription>
              Please approve the connection request in your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProcessing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Swap</DialogTitle>
            <DialogDescription>
              Your swap transaction is being processed. Please wait...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <DialogTitle className="text-2xl">Swap Successful!</DialogTitle>
              <DialogDescription className="text-base">
                Your swap has been completed successfully.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {swapResult && (
            <div className="space-y-3 text-left bg-secondary/30 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">From Address</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(swapResult.fromAddress);
                    toast({
                      title: "Copied!",
                      description: "Address copied to clipboard",
                    });
                  }}
                  className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
                >
                  {swapResult.fromAddress.slice(0, 8)}...{swapResult.fromAddress.slice(-6)}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">To Address</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(swapResult.toAddress);
                    toast({
                      title: "Copied!",
                      description: "Address copied to clipboard",
                    });
                  }}
                  className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
                >
                  {swapResult.toAddress.slice(0, 8)}...{swapResult.toAddress.slice(-6)}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">${swapResult.fee}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Transaction</span>
                <button
                  onClick={() => window.open(swapResult.explorerUrl, "_blank")}
                  className="flex items-center gap-1 font-mono text-xs hover:text-primary transition-colors"
                >
                  {swapResult.txHash.slice(0, 8)}...{swapResult.txHash.slice(-6)}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3 pb-4">
            {swapResult && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(swapResult.explorerUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Block Explorer
              </Button>
            )}
            <Button
              variant="gradient"
              onClick={() => setShowSuccessDialog(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
