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
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen && settings) {
          console.log("Resetting Form");
          console.log(settings);
          form.reset({
            workDuration: settings.workDuration,
            shortBreakDuration: settings.shortBreakDuration,
            longBreakDuration: settings.longBreakDuration,
            sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
            soundEnabled: settings.soundEnabled,
            notificationsEnabled: settings.notificationsEnabled,
          });
        }

        if (!isOpen) {
          form.reset();
        }

        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6 py-4">
              <SliderField control={form.control} name="workDuration" label="Work Duration" min={MIN_DURATION} max={MAX_DURATION} unit="min" />
              <SliderField control={form.control} name="shortBreakDuration" label="Short Break" min={MIN_DURATION} max={MAX_DURATION} unit="min" />
              <SliderField control={form.control} name="longBreakDuration" label="Long Break" min={MIN_DURATION} max={MAX_DURATION} unit="min" />
              <SliderField control={form.control} name="sessionsBeforeLongBreak" label="Sessions Before Long Break" min={MIN_SESSIONS} max={MAX_SESSIONS} unit="" />
              <FormField control={form.control} name="soundEnabled" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Sound</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="notificationsEnabled" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Notifications</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface SliderFieldProps {
  control: Control<SettingsFormValues>;
  name: keyof SettingsFormValues;
  label: string;
  min: number;
  max: number;
  unit: string;
};

const SliderField = ({ control, name, label, min, max, unit }: SliderFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <div className="flex items-center justify-between">
          <FormLabel>{label}</FormLabel>
          <span className="text-sm text-muted-foreground tabular-nums">
            {field.value as number}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
        <FormControl>
          <Slider
            value={[field.value as number]}
            min={min}
            max={max}
            step={1}
            onValueChange={([v]) => field.onChange(v)}
          />
        </FormControl>
        <FormMessage/>
      </FormItem>
    )}
  />
);