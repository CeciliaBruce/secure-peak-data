"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { Shield } from "lucide-react";

export interface ConsumptionDataPoint {
  time: string;
  consumption: number;
  encrypted: boolean;
}

interface ConsumptionGraphProps {
  data: ConsumptionDataPoint[];
}

const ConsumptionGraph = ({ data }: ConsumptionGraphProps) => {
  const encryptedCount = data.filter(d => d.encrypted).length;
  const totalConsumption = data.reduce((sum, d) => sum + d.consumption, 0);
  const avgConsumption = totalConsumption / data.length;

  return (
    <Card className="card-enhanced p-8 rounded-3xl interactive-card rainbow-border">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-energy rounded-3xl flex items-center justify-center energy-glow morphing-bg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs">📊</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground mb-2 text-gradient-animated">
              Energy Consumption Analytics
            </h2>
            <p className="text-muted-foreground text-lg">
              Real-time monitoring with FHE encryption protection
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-energy rounded-full animate-pulse"></div>
                <span className="text-sm text-energy font-medium">Live Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm text-accent font-medium">Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 glass-modern rounded-2xl">
              <div className="text-3xl font-black text-energy mb-1">{encryptedCount}</div>
              <div className="text-sm font-medium text-muted-foreground">🔐 Encrypted</div>
              <div className="text-xs text-muted-foreground mt-1">Protected</div>
            </div>
            <div className="text-center p-4 glass-modern rounded-2xl">
              <div className="text-3xl font-black text-accent mb-1">{data.length - encryptedCount}</div>
              <div className="text-sm font-medium text-muted-foreground">✅ Decrypted</div>
              <div className="text-xs text-muted-foreground mt-1">Verified</div>
            </div>
            <div className="text-center p-4 glass-modern rounded-2xl">
              <div className="text-3xl font-black text-primary mb-1">{avgConsumption.toFixed(1)}</div>
              <div className="text-sm font-medium text-muted-foreground">📊 Avg kWh</div>
              <div className="text-xs text-muted-foreground mt-1">Average</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 glass-modern rounded-2xl">
            <Shield className="w-8 h-8 text-energy animate-pulse" />
            <div>
              <div className="text-lg font-bold text-energy">FHE Protected</div>
              <div className="text-sm text-muted-foreground">End-to-end encryption</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 rounded-3xl"></div>
        <div className="relative p-6 glass-modern rounded-3xl">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--energy))" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="hsl(var(--energy-accent))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                className="opacity-20"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground font-medium"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground font-medium"
                tick={{ fontSize: 12 }}
                label={{ value: 'Consumption (kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-xl)',
              backdropFilter: 'blur(10px)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
            itemStyle={{ color: 'hsl(var(--energy))' }}
            formatter={(value: number | string, name: string) => [
              `${value} kWh`,
              name === 'consumption' ? 'Energy Usage' : name
            ]}
          />
          {data.filter(d => d.encrypted).map((point, index) => (
            <ReferenceDot
              key={index}
              x={point.time}
              y={point.consumption}
              r={8}
              fill="hsl(var(--accent))"
              stroke="hsl(var(--card))"
              strokeWidth={3}
              className="animate-pulse"
            />
          ))}
          <Line
            type="monotone"
            dataKey="consumption"
            stroke="url(#energyGradient)"
            strokeWidth={4}
            dot={{
              fill: 'hsl(var(--energy))',
              strokeWidth: 3,
              r: 6,
              className: 'drop-shadow-lg'
            }}
            activeDot={{
              r: 10,
              stroke: 'hsl(var(--energy))',
              strokeWidth: 3,
              fill: 'hsl(var(--card))',
              className: 'animate-pulse'
            }}
          />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default ConsumptionGraph;
