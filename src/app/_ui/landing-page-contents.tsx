"use client";
import Link from "next/link";
import { Timer, ListTodo, BarChart3, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Timer,
    title: "Focus Timer",
    description:
      "Stay in the zone with a customizable Pomodoro timer. Work in focused intervals with built-in breaks to maintain peak productivity.",
  },
  {
    icon: ListTodo,
    title: "Task Management",
    description:
      "Organize your work into clear, actionable tasks. Prioritize what matters and check off items as you complete them.",
  },
  {
    icon: BarChart3,
    title: "Statistics & Streaks",
    description:
      "Track your focus sessions over time. Build streaks, see your most productive days, and watch your habits improve.",
  },
  {
    icon: Settings2,
    title: "Customizable Settings",
    description:
      "Tailor timer durations, break lengths, and notifications to fit your personal workflow.",
  },
];

const STEPS = [
  { number: "1", title: "Set your tasks", description: "Add the tasks you want to tackle during your focus session." },
  { number: "2", title: "Start the timer", description: "Hit start and work in focused intervals with timed breaks." },
  { number: "3", title: "Track your progress", description: "Review your stats, build streaks, and keep improving." },
];

export const LandingPageContents = () => {
  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({behavior: "smooth"});
  };
  
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Navbar  */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <button className="text-lg font-semibold tracking-light" onClick={() => scrollToId("hero")}>
            NextTimer
          </button>
          
          <nav className="hidden items-center gap-6 md:flex">
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground" onClick={() => scrollToId("features")}>
              Features
            </button>
            <button className="text-sm text-muted-foreground transition-colors hover:text-foreground" onClick={() => scrollToId("how-it-works")}>
              How it works
            </button>
          </nav>

          <div className="flex gap-2 items-center">
            <Link href="/login">
              <Button className="hidden sm:inline-flex" variant="ghost">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="flex flex-col items-center justify-center gap-6 px-4 py-24 md:py-32 text-center">
        <Badge variant="secondary" className="text-sm">
          Free &amp; Open Source
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Stay Focused. Get More Done.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          A simple Pomodoro timer that helps you break work into focused
          intervals, manage tasks, and build productive habits — one session at
          a time.
        </p>
        <div className="flex gap-4 mt-2">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-4 py-16 md:py-24 bg-muted/40"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything you need to focus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <f.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {STEPS.map((s) => (
              <div key={s.number} className="flex flex-col items-center gap-3">
                <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {s.number}
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-6 px-4 py-16 md:py-24 bg-muted/40 text-center">
        <h2 className="text-3xl md:text-4xl font-bold max-w-2xl">
          Ready to boost your productivity?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl">
          Join now and start your first Pomodoro session. It only takes a
          minute to get going.
        </p>
        <Link href="/login">
          <Button size="lg">Start Your First Pomodoro</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center px-4 py-6 text-sm text-muted-foreground">
        <p>Pomodoro Timer &middot; Built with Next.js</p>
      </footer>
    </div>
  );
};