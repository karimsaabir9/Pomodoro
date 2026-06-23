"use client";

import { SignoutButton } from "@/components/auth/signout-button";
import { Header } from "./header";
import { CircularTimer } from "./circular-timer";
import { SessionIndicator } from "./session-indicator";
import { TimerControls } from "./timer-controls";
import { TimerProvider } from "@/lib/timer-context";
import { TaskPanel } from "./task-panel";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveTaskLabel } from "./active-task-label";
import { StatsPanel } from "./stats-panel";

// =============================================================================
// HOME PAGE CONTENTS - Client component for the authenticated home page
// =============================================================================
//
// WHY: Separates client-side interactivity from server-side auth checks.
// This component can use hooks and handle user interactions.
//
// EXTEND THIS:
//   - Add user profile display
//   - Show tRPC data with useTRPC hook
//   - Add navigation to other protected routes
// =============================================================================

export const HomePageContents = () => {
  return (
    <TimerProvider>
      <div className="flex flex-col items-center justify-center min-h-screen w-full gap-4">
        <Header/>
        <main className="flex flex-col gap-8 items-center py-8 w-full">
          
          <section className="flex flex-col items-center gap-4">
            <CircularTimer/>
            <SessionIndicator/>
            <ActiveTaskLabel/>
            <TimerControls/>
          </section>
          
          <div className="gap-8 grid grid-cols-1 md:grid-cols-2 px-2 w-full">
            <Card>
              <CardContent>
                <TaskPanel/>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <StatsPanel/>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </TimerProvider>
  );
};

export const HomePageContentsSkeleton = () => (
  <div className="flex flex-col items-center min-h-screen w-full max-w-2xl mx-auto px-4">
    {/* Header skeleton */}
    <header className="flex items-center justify-between w-full py-4 px-2">
      <div className="h-7 w-28 rounded bg-muted animate-pulse" />
      <div className="flex items-center gap-2">
        <div className="size-9 rounded bg-muted animate-pulse" />
        <div className="size-9 rounded bg-muted animate-pulse" />
      </div>
    </header>
    <main className="flex flex-col items-center w-full gap-8 py-8">
      {/* Timer skeleton */}
      <section className="flex flex-col items-center gap-4">
        <div className="size-64 rounded-full bg-muted animate-pulse" />
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="size-3 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 rounded bg-muted animate-pulse" />
          <div className="h-10 w-20 rounded bg-muted animate-pulse" />
        </div>
      </section>
      {/* Task + Stats skeleton */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-6 w-16 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded bg-muted animate-pulse" />
          <div className="h-16 w-full rounded bg-muted animate-pulse" />
          <div className="h-16 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-20 rounded bg-muted animate-pulse" />
          <div className="flex gap-4">
            <div className="h-20 flex-1 rounded bg-muted animate-pulse" />
            <div className="h-20 flex-1 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-50 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    </main>
  </div>
);