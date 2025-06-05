
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Clock, Repeat, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { FocusSessionData, DailyFocusRecord, OverallStats } from '@/types';
import { format, subDays, parseISO, eachDayOfInterval, startOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

const FOCUS_SESSIONS_STORAGE_KEY = 'focusFlowSessionsLog';

const chartConfig = {
  minutes: {
    label: 'Focus Minutes',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


export default function StatsPage() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyFocusRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const processFocusData = useCallback(() => {
    setIsLoading(true);
    try {
      const storedSessionsRaw = localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
      const sessions: FocusSessionData[] = storedSessionsRaw ? JSON.parse(storedSessionsRaw) : [];

      if (sessions.length === 0) {
        setOverallStats({ totalFocusMinutes: 0, totalFocusSessions: 0, averageSessionDuration: 0 });
        setDailyData([]);
        setIsLoading(false);
        return;
      }

      let totalMinutes = 0;
      sessions.forEach(session => {
        totalMinutes += session.duration;
      });

      const totalSessions = sessions.length;
      const averageDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

      setOverallStats({
        totalFocusMinutes: totalMinutes,
        totalFocusSessions: totalSessions,
        averageSessionDuration: averageDuration,
      });

      // Prepare data for the last 7 days chart
      const today = startOfDay(new Date());
      const last7DaysInterval = { start: subDays(today, 6), end: today };
      const dateRange = eachDayOfInterval(last7DaysInterval);

      const aggregatedDailyData: DailyFocusRecord[] = dateRange.map(dayDate => {
        const formattedDay = format(dayDate, 'yyyy-MM-dd');
        let minutesForDay = 0;
        sessions.forEach(session => {
          // Compare only the date part of session.date (which is already startOfDay)
          if (format(parseISO(session.date), 'yyyy-MM-dd') === formattedDay) {
            minutesForDay += session.duration;
          }
        });
        return {
          date: format(dayDate, 'MMM d'), // Format for XAxis display
          totalMinutes: minutesForDay,
        };
      });
      setDailyData(aggregatedDailyData);
    } catch (error) {
      console.error("Error processing focus data:", error);
      setOverallStats({ totalFocusMinutes: 0, totalFocusSessions: 0, averageSessionDuration: 0 });
      setDailyData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    processFocusData();
  }, [processFocusData]);
  
  const chartData = useMemo(() => dailyData, [dailyData]);

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="py-6 mb-8 text-center border-b">
          <div className="container mx-auto flex items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary font-headline">
              Focus Statistics
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 pb-12 flex-grow max-w-3xl flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
         <footer className="text-center py-6 text-base text-muted-foreground border-t">
            FocusFlow &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-6 mb-8 text-center border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-2 flex-grow">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary font-headline">
              Focus Statistics
            </h1>
          </div>
           <div className="w-[calc(100px)]"></div> {/* Spacer to balance the back button */}
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12 flex-grow max-w-3xl">
        <Alert className="mb-8 bg-accent/10 border-accent/30">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle className="text-accent-foreground/90 font-semibold">Data Source</AlertTitle>
          <AlertDescription className="text-accent-foreground/80">
            These statistics are based on completed Focus Timer sessions and are stored locally in your browser. Clearing your browser data may remove this history.
          </AlertDescription>
        </Alert>

        {overallStats && (
          <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
                <Clock className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallStats.totalFocusMinutes} min</div>
                <p className="text-xs text-muted-foreground">Across all sessions</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                <Repeat className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallStats.totalFocusSessions}</div>
                <p className="text-xs text-muted-foreground">Total focus blocks</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallStats.averageSessionDuration} min</div>
                <p className="text-xs text-muted-foreground">Average per session</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-10">
          <Card className="shadow-lg p-2 sm:p-4">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Daily Focus Trend (Last 7 Days)</CardTitle>
              <CardDescription>Total minutes focused each day.</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] sm:h-[350px] w-full">
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/30" />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          className="text-xs fill-muted-foreground"
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          className="text-xs fill-muted-foreground"
                          label={{ value: 'Minutes', angle: -90, position: 'insideLeft', offset: 10, className: 'fill-muted-foreground text-sm' }}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="totalMinutes" fill="var(--color-minutes)" radius={[4, 4, 0, 0]}>
                           <LabelList dataKey="totalMinutes" position="top" offset={5} className="fill-foreground font-medium text-xs" formatter={(value: number) => (value > 0 ? value : '')} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No focus sessions recorded in the last 7 days.</p>
                  <p className="text-sm mt-2">Complete some Focus Timer sessions to see your stats here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        <div className="text-center mt-8">
            <Button onClick={processFocusData} variant="outline">
                <Repeat className="mr-2 h-4 w-4" /> Refresh Stats
            </Button>
        </div>
      </main>

      <footer className="text-center py-6 text-base text-muted-foreground border-t mt-auto">
        FocusFlow &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
