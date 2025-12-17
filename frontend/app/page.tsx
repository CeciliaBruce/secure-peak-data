"use client";

import { useCallback } from "react";
import Header from "@/components/Header";
import ConsumptionGraph, {
  ConsumptionDataPoint,
} from "@/components/ConsumptionGraph";
import DataGrid, { ConsumptionRecord } from "@/components/DataGrid";
import CreateEntryDialog from "@/components/CreateEntryDialog";
import Footer from "@/components/Footer";
import { useAccount } from "wagmi";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useMetaMask } from "@/hooks/metamask/useMetaMaskProvider";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSecurePeakData } from "@/hooks/useSecurePeakData";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";

// Initial graph data for visualization
const initialGraphData: ConsumptionDataPoint[] = [
  { time: "00:00", consumption: 420, encrypted: false },
  { time: "04:00", consumption: 380, encrypted: false },
  { time: "08:00", consumption: 920, encrypted: true },
  { time: "12:00", consumption: 1100, encrypted: true },
  { time: "16:00", consumption: 850, encrypted: false },
  { time: "20:00", consumption: 780, encrypted: true },
];

export default function Home() {
  const { isConnected } = useAccount();
  const { provider } = useMetaMask();
  const {
    ethersSigner,
    ethersReadonlyProvider,
    chainId,
    sameChain,
    sameSigner,
  } = useMetaMaskEthersSigner();
  const { storage } = useInMemoryStorage();
  const { instance } = useFhevm({
    provider,
    chainId,
  });

  const {
    records,
    graphData,
    isCreating,
    isDecrypting,
    createRecord,
    decryptRecord,
    isDeployed,
  } = useSecurePeakData({
    instance,
    fhevmDecryptionSignatureStorage: storage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const handleCreateEntry = useCallback(
    async (entry: {
      timestamp: string;
      consumption: number;
      peak: boolean;
      reason: string;
      encrypted: boolean;
    }) => {
      if (!isConnected) {
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to create entries",
          variant: "destructive",
        });
        return;
      }

      try {
        await createRecord(entry.consumption, entry.peak, entry.timestamp);
        toast({
          title: "Entry Created",
          description: "Consumption record has been added to the blockchain",
        });
      } catch (error) {
        console.error("Create entry error:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create entry. Please try again.",
          variant: "destructive",
        });
      }
    },
    [isConnected, createRecord]
  );

  const handleDecrypt = useCallback(
    async (recordId: number) => {
      if (!isConnected) {
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to decrypt data",
          variant: "destructive",
        });
        return;
      }

      try {
        await decryptRecord(recordId);
        toast({
          title: "Decryption Complete",
          description: "Record data has been decrypted",
        });
      } catch (error) {
        console.error("Decrypt error:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to decrypt record. Please try again.",
          variant: "destructive",
        });
      }
    },
    [isConnected, decryptRecord]
  );

  // Use contract data if available, otherwise show empty state
  const displayGraphData =
    graphData.length > 0 ? graphData : initialGraphData;
  const displayRecords: ConsumptionRecord[] = records;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Enhanced Header with Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 animated-bg"
             style={{ backgroundImage: 'var(--gradient-hero)' }}>
          <div className="absolute inset-0 opacity-20"
               style={{ backgroundImage: 'var(--gradient-mesh)' }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-energy/10 rounded-full blur-xl float"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/10 rounded-full blur-lg float" style={{ animationDelay: '4s' }}></div>

        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>

        <Header />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 floating-particles">
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Logo/Icon */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-energy rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative w-20 h-20 bg-gradient-glass rounded-3xl flex items-center justify-center border border-white/20 energy-glow group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Typography */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
              <span className="text-gradient-animated">
                Secure Peak Data
              </span>
              <br />
              <span className="bg-gradient-to-r from-energy via-energy-accent to-accent bg-clip-text text-transparent animate-pulse">
                Encrypted & Protected
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Experience the future of data privacy with <span className="font-semibold text-energy">Fully Homomorphic Encryption</span>.
              Monitor energy consumption patterns while keeping your sensitive data completely confidential.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <CreateEntryDialog
                onCreateEntry={handleCreateEntry}
                isCreating={isCreating}
              />
              {!isConnected && (
                <button className="btn-energy text-lg px-8 py-4 min-w-[220px] glow-pulse">
                  🔗 Connect Wallet
                </button>
              )}
            </div>

            {/* Advanced Status Indicators */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {chainId && (
                <div className={`inline-flex items-center gap-3 glass-modern rounded-2xl px-6 py-3 transition-all duration-300 ${
                  isDeployed ? 'status-success' : 'status-error'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    isDeployed ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {isDeployed ? '✅ Contract Active' : '❌ Contract Inactive'}
                  </span>
                </div>
              )}

              <div className="inline-flex items-center gap-3 glass-modern rounded-2xl px-6 py-3 status-success">
                <div className="w-3 h-3 rounded-full bg-energy animate-pulse"></div>
                <span className="text-sm font-medium">🔐 FHE Protected</span>
              </div>

              <div className="inline-flex items-center gap-3 glass-modern rounded-2xl px-6 py-3 status-success">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
                <span className="text-sm font-medium">⚡ Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <main className="flex-1 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'var(--gradient-mesh)' }}></div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="space-y-12">
            {/* Enhanced Statistics Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-enhanced p-8 rounded-3xl text-center interactive-card group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-energy rounded-2xl flex items-center justify-center mx-auto energy-glow group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{displayRecords.length}</span>
                  </div>
                </div>
                <div className="text-4xl font-black text-foreground mb-2">{displayRecords.length}</div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Total Records</div>
                <div className="text-xs text-muted-foreground">Active data entries in system</div>
              </div>

              <div className="card-enhanced p-8 rounded-3xl text-center interactive-card group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-energy-secondary to-energy-accent rounded-2xl flex items-center justify-center mx-auto glow-pulse group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-energy rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">🔐</span>
                  </div>
                </div>
                <div className="text-4xl font-black text-energy mb-2">
                  {displayRecords.filter(r => r.encrypted).length}
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Encrypted Data</div>
                <div className="text-xs text-muted-foreground">FHE-protected records</div>
              </div>

              <div className="card-enhanced p-8 rounded-3xl text-center interactive-card group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-energy-accent rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">✓</span>
                  </div>
                </div>
                <div className="text-4xl font-black text-accent mb-2">
                  {displayRecords.filter(r => !r.encrypted).length}
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Decrypted Data</div>
                <div className="text-xs text-muted-foreground">Verified & accessible</div>
              </div>

              <div className="card-enhanced p-8 rounded-3xl text-center interactive-card group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-energy rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">📊</span>
                  </div>
                </div>
                <div className="text-4xl font-black text-primary mb-2">
                  {displayGraphData.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Data Points</div>
                <div className="text-xs text-muted-foreground">Analytics ready</div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="bounce-in">
              <ConsumptionGraph data={displayGraphData} />
            </section>

            {/* Enhanced Data Grid Section */}
            <section className="slide-up">
              <div className="card-enhanced p-8 rounded-3xl">
                <DataGrid
                  data={displayRecords}
                  onDecrypt={handleDecrypt}
                  isDecrypting={isDecrypting}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
