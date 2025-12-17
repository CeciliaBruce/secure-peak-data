"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Zap, Lock } from "lucide-react";

const Header = () => {
  return (
    <header className="relative z-20 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Enhanced Logo */}
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-energy rounded-2xl flex items-center justify-center energy-glow shadow-glow">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Enhanced Branding */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
              <Zap className="w-7 h-7 text-primary animate-pulse" />
              <span className="bg-gradient-energy bg-clip-text text-transparent">
                Secure Peak Data
              </span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              FHE-Powered Energy Security
            </p>
          </div>
        </div>

        {/* Enhanced Connect Button */}
        <div className="glass rounded-2xl p-2 hover:bg-white/10 transition-all duration-300">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
