"use client";
import z from "zod";

import { Check, ChevronDown, ChevronUp, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_TASK_INFO } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Task } from "@/lib/types";
import { useTimer } from "@/lib/timer-context";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const TaskPanel = () => {
  const trpc = useTRPC();

  const {data: tasks} = useSuspenseQuery(trpc.tasks.list.queryOptions());

  // const activeTasks = tasks.filter(t => !t.isCompleted);
  // const completedTasks = tasks.filter(t => t.isCompleted);

  const {active: activeTasks, completed: completedTasks} = tasks.reduce<{
    active: Task[];
    completed: Task[];
  }>(
    (acc, t) => {
      (t.isCompleted ? acc.completed: acc.active).push(t);
      return acc;
    },
    {active: [], completed: []},
  );

  return (
    <div className="space-y-4 w-full">
      <h2 className="font-semibold text-lg">
        Tasks
      </h2>
      <TaskInput/>

      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No tasks yet. Add one above to get started
        </p>
      )}
      <div className="space-y-2">
        {activeTasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            totalActive={activeTasks.length}
            allTasks={activeTasks}
          />
        ))}
      </div>
      {completedTasks.length > 0 && (
        <CompletedTasksToggle tasks={completedTasks}/>
      )}
    </div>
  );
};

const taskInputSchema = z.object({
  title: z.string().min(DEFAULT_TASK_INFO.minTaskLength),
  estimatedPomodoros: z.number().min(DEFAULT_TASK_INFO.minPomodoros).max(DEFAULT_TASK_INFO.maxPomodoros),
});

type TaskInputValues = z.infer<typeof taskInputSchema>;

const TaskInput = () => {
  const form = useForm<TaskInputValues>({
    defaultValues: { title: "", estimatedPomodoros: 1 },
    resolver: zodResolver(taskInputSchema),
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.tasks.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: trpc.tasks.list.queryKey()});
        form.reset();
      },
      onError: () => {
        toast.error("Oops, failed");
      },
    })
  );

  const onSubmit = (values: TaskInputValues) => {
    createMutation.mutate({
      title: values.title.trim(),
      estimatedPomodoros: values.estimatedPomodoros
    })
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
      <Input
        placeholder="Add a task..."
        {...form.register("title")}
        className="flex-1"
      />
      <Input
        type="number"
        min={DEFAULT_TASK_INFO.minPomodoros}
        max={DEFAULT_TASK_INFO.maxPomodoros}
        {...form.register("estimatedPomodoros", {valueAsNumber: true})}
        className="w-16 text-center"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!form.formState.isValid || createMutation.isPending}
      >
        <Plus className="size-4"/>
      </Button>
    </form>
  );
};

interface TaskItemProps {
  task: Task;
  index: number;
  totalActive: number;
  allTasks: Task[];
};

const TaskItem = ({task, index, totalActive, allTasks}: TaskItemProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { state, setActiveTask } = useTimer();
  const isActive = state.activeTaskId === task.id;

  const updateMutation = useMutation(
    trpc.tasks.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: trpc.tasks.list.queryKey()
      }),
    })
  );

  const deleteMutation = useMutation(
    trpc.tasks.delete.mutationOptions({
      onSuccess: () => {
        if(isActive) setActiveTask(null);
        queryClient.invalidateQueries({
          queryKey: trpc.tasks.list.queryKey()
        })
      },
    })
  );

  const reorderMutation = useMutation(
    trpc.tasks.reorder.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: trpc.tasks.list.queryKey()
      })
    })
  );

  const handleMoveUp = () => {
    if(index === 0) return;
    const prev = allTasks[index - 1];
    reorderMutation.mutate([
      {id: task.id, sortOrder: prev.sortOrder},
      {id: prev.id, sortOrder: task.sortOrder}
    ]);
  };
  const handleMoveDown = () => {
    if(index === totalActive - 1) return;
    const next = allTasks[index + 1];
    reorderMutation.mutate([
      {id: task.id, sortOrder: next.sortOrder},
      {id: next.id, sortOrder: task.sortOrder},
    ])
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
        isActive ? "border-red-500/50 bg-red-500/5" : ""
      }`}>
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={(checked) => updateMutation.mutate({
          id: task.id, isCompleted: !!checked
        })}
      />
      <span className="flex-1 text-sm truncate">{task.title}</span>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {task.actualPomodoros}/{task.estimatedPomodoros}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleMoveUp}
          disabled={index === 0}
        >
          <ChevronUp className="size-3"/>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={handleMoveDown}
          disabled={index === (allTasks.length - 1)}
        >
          <ChevronDown className="size-3"/>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setActiveTask(isActive ? null: task.id)}
        >
          <Target className="size-3"/>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => {
            if(!confirm("Are you sure you want to delete this task?")) return;
            deleteMutation.mutate({id: task.id});
          }}
          disabled={index === 0}
        >
          <Trash2 className="size-3"/>
        </Button>
      </div>
    </div>
  );
};

const CompletedTasksToggle = ({tasks}: {tasks: Task[]}) => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    trpc.tasks.delete.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: trpc.tasks.list.queryKey()
      }),
    })
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between text-sm text-muted-foreground"
        >
          <span>Completed ({tasks.length})</span>
          {open ? <ChevronUp className="size-4"/>: <ChevronDown className="size-4"/>}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 space-y-2">
          {tasks.map(task => (
            <div className="flex items-center gap-2 rounded-lg border p-3 opacity-60" key={task.id}>
              <Check className="size-4 text-green-500 shrink-0"/>
              <span className="flex-1 text-sm line-through truncate">{task.title}</span>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {task.actualPomodoros}/{task.estimatedPomodoros}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => {
                  if(!confirm("Are you sure you want to delete this task?")) return;
                  deleteMutation.mutate({id: task.id});
                }}
              >
                <Trash2 className="size-3"/>
              </Button>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};