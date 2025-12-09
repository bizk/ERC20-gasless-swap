import { useState } from "react";
import { SwapCard, SwapSuccessData } from "@/components/SwapCard";
import { SuccessScreen } from "@/components/SuccessScreen";

const Index = () => {
  const [swapResult, setSwapResult] = useState<SwapSuccessData | null>(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">⟠</span>
            </div>
            <span className="text-xl font-bold gradient-text">1ClickSwap</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          {swapResult ? (
            <SuccessScreen
              data={swapResult}
              onNewSwap={() => setSwapResult(null)}
            />
          ) : (
            <>
              <div className="text-center mb-10 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Swap tokens in <span className="gradient-text">one click</span>
                </h1>
              </div>
              <SwapCard onSwapSuccess={setSwapResult} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
