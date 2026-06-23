import { createTRPCRouter } from "../init";
import { sessionsRouter } from "./sessions";
import { settingsRouter } from "./settings";
import { tasksRouter } from "./tasks";

// =============================================================================
// APP ROUTER - Root tRPC router that combines all sub-routers
// =============================================================================
//
// WHY: This is the main entry point for all tRPC procedures. Sub-routers
// can be added here to organize procedures by feature/domain.
//
// EXAMPLE USAGE:
//   import { userRouter } from "./user";
//   import { postRouter } from "./post";
//
//   export const appRouter = createTRPCRouter({
//     user: userRouter,
//     post: postRouter,
//   });
//
// THEN ON CLIENT:
//   trpc.user.getProfile.useQuery()
//   trpc.post.create.useMutation()
// =============================================================================

export const appRouter = createTRPCRouter({
  // Add routers here as you build features
  // Example: user: userRouter,
  sessions: sessionsRouter,
  settings: settingsRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
