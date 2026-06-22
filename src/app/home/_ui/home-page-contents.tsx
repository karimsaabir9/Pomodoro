"use client";

import { Header } from "./header";

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
    <div className="flex flex-col items-center justify-center min-h-screen w-full gap-4">
      <Header />
      <main className="flex flex-col gap-8 items-center py-8 w-full">
        {/* TODO: Timer Section */}
        {/* TODO: Todo List */}
        {/* TODO: Stats Panel */}
      </main>
    </div>
  );
};
