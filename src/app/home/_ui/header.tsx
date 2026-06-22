"use client";
import { SignoutButton } from "@/components/auth/signout-button";

import { SettingsDialog } from "./settings-dialog";

export const Header = () => (
  <header className="flex items-center justify-between w-full py-4 px-2">
    <h1 className="font-bold text-xl">NextTimer</h1>
    <div className="flex gap-2 items-center">
      <SettingsDialog/>
      <SignoutButton/>
    </div>
  </header>
);