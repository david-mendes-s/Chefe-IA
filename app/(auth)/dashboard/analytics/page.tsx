'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeeklyStats } from '@/actions/analytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import SpinLoader from "@/components/SpinLoader";
import { CheckCircle2, Trophy, Target } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyStats().then(stats => {
      setData(stats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><SpinLoader /></div>;
  }

  if (!data) return <div>Erro ao carregar dados.</div>;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Progresso</h1>
        <p className="text-muted-foreground">Métricas da sua produtividade recente.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missões Cumpridas (30d)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalTasks30d}</div>
            <p className="text-xs text-muted-foreground">tarefas finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias Perfeitos (7d)</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.cyclesCompleted7d}</div>
            <p className="text-xs text-muted-foreground">dias com 100% concluído</p>
          </CardContent>
        </Card>
        {/* Placeholder for future metric */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foco Principal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {data.contextChart[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">objetivo mais ativo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Produtividade Semanal</CardTitle>
            <CardDescription>Tarefas Concluídas vs Pendentes</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyChart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="completed" name="Concluídas" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                <Bar dataKey="pending" name="Pendentes" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Context Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Foco (30d)</CardTitle>
            <CardDescription>Onde você tem investido sua energia</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.contextChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.contextChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
