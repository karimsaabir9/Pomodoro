"use client";
import z from "zod";

import { useState } from "react";
import { Control, useForm } from "react-hook-form";
import { Settings } from "lucide-react";

import { DEFAULT_SETTINGS, MAX_DURATION, MAX_SESSIONS, MIN_DURATION, MIN_SESSIONS } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const settingsFormSchema = z.object({
  workDuration: z.number().min(MIN_DURATION).max(MAX_DURATION),
  shortBreakDuration: z.number().min(MIN_DURATION).max(MAX_DURATION),
  longBreakDuration: z.number().min(MIN_DURATION).max(MAX_DURATION),
  sessionsBeforeLongBreak: z.number().min(MIN_SESSIONS).max(MAX_SESSIONS),
  soundEnabled: z.boolean(),
  notificationsEnabled: z.boolean(),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {data: settings} = useQuery(trpc.settings.get.queryOptions());

  const form = useForm<SettingsFormValues>({
    defaultValues: DEFAULT_SETTINGS,
    resolver: zodResolver(settingsFormSchema),
  });

  const updateMutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: trpc.settings.get.queryKey()});
        form.reset();
        setOpen(false);
      },
    }),
  );

  const onSubmit = (values: SettingsFormValues) => {
    updateMutation.mutate(values);
  };

return (

)
}