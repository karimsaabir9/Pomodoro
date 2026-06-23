import { eq } from "drizzle-orm";
import { z } from "zod";

import { userSetting } from "@/db/schema";

import { createTRPCRouter, protectedProcedure } from "../init";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ctx}) => {
    const settings = await ctx.db.query.userSetting.findFirst({
      where: eq(userSetting.userId, ctx.user.id),
    });

    return settings ?? { ...DEFAULT_SETTINGS, userId: ctx.user.id };
  }),

  update: protectedProcedure.input(
    z.object({
      workDuration: z.number().min(1).max(60).optional(),
      shortBreakDuration: z.number().min(1).max(60).optional(),
      longBreakDuration: z.number().min(1).max(60).optional(),
      sessionsBeforeLongBreak: z.number().min(1).max(10).optional(),
      soundEnabled: z.boolean().optional(),
      notificationsEnabled: z.boolean().optional(),
    })
  ).mutation(async ({ctx, input}) => {
    const existing = await ctx.db.query.userSetting.findFirst({
      where: eq(userSetting.userId, ctx.user.id),
    });

    if(existing) {
      const [updated] = await ctx.db.update(userSetting).set({
        ...input,
        updatedAt: new Date(),
      }).where(eq(userSetting.userId, ctx.user.id)).returning();

      return updated;
    }

    const [created] = await ctx.db.insert(userSetting).values({
      id: crypto.randomUUID(),
      userId: ctx.user.id,
      ...DEFAULT_SETTINGS,
      ...input,
    }).returning();

    return created;
  }),
});