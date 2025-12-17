"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Calendar, Zap, AlertTriangle, Shield, CheckCircle, Clock, Database } from "lucide-react";
import { useAccount } from "wagmi";

export interface ConsumptionRecord {
  id: number;
  timestamp: string;
  consumption: number | string;
  peak: boolean;
  reason: string;
  encrypted: boolean;
  isDecrypted?: boolean;
}

interface DataGridProps {
  data: ConsumptionRecord[];
  onDecrypt?: (recordId: number) => void;
  isDecrypting?: boolean;
}

const DataGrid = ({ data, onDecrypt, isDecrypting }: DataGridProps) => {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-energy rounded-3xl flex items-center justify-center energy-glow">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{data.length}</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-foreground mb-2 text-gradient-animated">
            Consumption Records
          </h2>
          <p className="text-muted-foreground text-lg">
            Encrypted peak data and outage reasons with FHE protection
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-energy rounded-full animate-pulse"></div>
              <span className="text-sm text-energy font-medium">Secure Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-sm text-accent font-medium">Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      {data.length === 0 ? (
        <Card className="card-enhanced p-12 rounded-3xl text-center">
          <div className="w-24 h-24 bg-muted/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Database className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">No Records Yet</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your consumption records will appear here once you create them.
            Start by adding your first energy consumption entry above.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {data.map((record, index) => (
            <Card
              key={record.id}
              className="card-enhanced p-6 rounded-3xl interactive-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        record.encrypted && !record.isDecrypted
                          ? 'bg-gradient-to-br from-encrypted to-energy-accent'
                          : 'bg-gradient-to-br from-success to-energy'
                      }`}>
                        {record.encrypted && !record.isDecrypted ? (
                          <Lock className="w-6 h-6 text-white" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground">
                            Record #{record.id}
                          </h3>
                          {record.peak && (
                            <Badge className="bg-encrypted text-white px-3 py-1 rounded-xl font-semibold">
                              ⚡ Peak Usage
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{record.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                      record.encrypted && !record.isDecrypted
                        ? 'bg-encrypted/10 text-encrypted border border-encrypted/20'
                        : 'bg-success/10 text-success border border-success/20'
                    }`}>
                      {record.encrypted && !record.isDecrypted ? '🔐 Encrypted' : '✅ Decrypted'}
                    </div>
                  </div>

                  {/* Consumption & Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-energy" />
                        <span className="text-sm font-medium text-muted-foreground">Consumption</span>
                      </div>
                      <div className={`text-2xl font-black ${
                        record.isDecrypted || !record.encrypted
                          ? 'text-energy'
                          : 'text-muted-foreground'
                      }`}>
                        {record.isDecrypted || !record.encrypted
                          ? `${record.consumption} kWh`
                          : "**** kWh"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium text-muted-foreground">Reason</span>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {record.encrypted && !record.isDecrypted ? (
                          isConnected ? (
                            <span className="text-muted-foreground italic flex items-center gap-2">
                              <Lock className="w-3 h-3" />
                              Encrypted - Ready to decrypt
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic flex items-center gap-2">
                              <Lock className="w-3 h-3" />
                              Connect wallet to access
                            </span>
                          )
                        ) : (
                          record.reason
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                  {record.encrypted && !record.isDecrypted && isConnected && (
                    <Button
                      onClick={() => onDecrypt?.(record.id)}
                      disabled={isDecrypting}
                      className="btn-energy w-full gap-3 text-base"
                    >
                      {isDecrypting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Decrypting...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Decrypt Data</span>
                        </>
                      )}
                    </Button>
                  )}

                  {(!record.encrypted || record.isDecrypted) && (
                    <div className="flex items-center justify-center gap-2 p-4 glass-modern rounded-2xl">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">Data Available</span>
                    </div>
                  )}

                  {!isConnected && record.encrypted && (
                    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-2xl">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Wallet Required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Indicator */}
              {record.encrypted && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Protected by FHE encryption
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Blockchain verified
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Connection Notice */}
      {!isConnected && data.length > 0 && (
        <Card className="card-enhanced p-6 rounded-3xl border-warning/50 bg-warning/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/20 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">Wallet Connection Required</h3>
              <p className="text-muted-foreground">
                Connect your wallet to access encrypted consumption data and decrypt sensitive outage information.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataGrid;
