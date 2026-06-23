"use client";

import { TimerProvider } from "@/lib/timer-context";
import { CircularTimer } from "./circular-timer";
import { Header } from "./header";
import { SessionIndicator } from "./session-indicator";
import { TimerControls } from "./timer-controls";

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
        <Header />
        <main className="flex flex-col gap-8 items-center py-8 w-full">
          <section className="flex flex-col items-center gap-4">
            <CircularTimer />
            <SessionIndicator />
            <TimerControls />
          </section>
        </main>
      </div>
    </TimerProvider>
  );
};
