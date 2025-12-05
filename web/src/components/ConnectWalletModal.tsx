import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
  isConnecting: boolean;
}

// TODO metamask connection
export const ConnectWalletModal = ({
  open,
  onClose,
  onConnect,
  isConnecting,
}: ConnectWalletModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-float">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <p className="text-center text-muted-foreground">
            Connect your MetaMask wallet to continue with the swap
          </p>
          <Button
            variant="gradient"
            size="xl"
            className="w-full"
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  className="w-6 h-6"
                />
                Connect MetaMask
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
