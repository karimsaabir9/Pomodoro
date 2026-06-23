import z from "zod";

import { and, count, eq, gte, sql } from "drizzle-orm";
import { pomodoroSession, pomodoroStats } from "@/db/schema";

import { createTRPCRouter, protectedProcedure } from "../init";

function utcTodayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

function utcDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
};

export const sessionsRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({
    taskId: z.string().nullable(),
    duration: z.number().min(1),
    type: z.enum(["work", "short_break", "long_break"]),
  })).mutation(async ({ctx, input}) => {
    const [created] = await ctx.db.insert(pomodoroSession).values({
      id: crypto.randomUUID(),
      userId: ctx.user.id,
      taskId: input.taskId,
      duration: input.duration,
      type: input.type
    }).returning();

    const today = utcDateString();
    const durationSeconds = input.duration * 60;
    const isWork = input.type === "work";

    await ctx.db.insert(pomodoroStats).values({
      id: crypto.randomUUID(),
      userId: ctx.user.id,
      date: today,
      completedPomodoros: isWork ? 1: 0,
      totalFocusTime: isWork ? durationSeconds: 0,
      totalBreakTime: isWork ? 0: durationSeconds,
    }).onConflictDoUpdate({
      target: [pomodoroStats.userId, pomodoroStats.date],
      set: {
        completedPomodoros: isWork 
          ? sql`${pomodoroStats.completedPomodoros} + 1`
          : pomodoroStats.completedPomodoros,
        totalFocusTime: isWork
          ? sql`${pomodoroStats.totalFocusTime} + ${durationSeconds}`
          : pomodoroStats.totalFocusTime,
        totalBreakTime: isWork
          ? pomodoroStats.totalBreakTime
          : sql`${pomodoroStats.totalBreakTime} + ${durationSeconds}`
      },
    });

    return created;
  }),
  todayCount: protectedProcedure.query(async ({ctx}) => {
    const todayStart = utcTodayStart();

    const result = await ctx.db.select({ count: count() })
      .from(pomodoroSession)
      .where(
        and(
          eq(pomodoroSession.userId, ctx.user.id),
          eq(pomodoroSession.type, "work"),
          gte(pomodoroSession.completedAt, todayStart),
        )
      );
    return result[0]?.count ?? 0;
  }),
  stats: protectedProcedure.input(z.enum(["week", "month"]).default("week")).query(async ({ctx, input}) => {
    const daysBack = input === "week" ? 7: 30;
    const startDate = utcTodayStart();
    startDate.setUTCDate(startDate.getUTCDate() - daysBack);

    const result = await ctx.db.select({
      date: sql<string>`date(${pomodoroSession.completedAt})`.as("date"),
      count: count(),
    }).from(pomodoroSession).where(
      and(
        eq(pomodoroSession.userId, ctx.user.id),
        eq(pomodoroSession.type, "work"),
        gte(pomodoroSession.completedAt, startDate),
      )
    ).groupBy(sql`date(${pomodoroSession.completedAt})`)
    .orderBy(sql`date(${pomodoroSession.completedAt})`);

    return result;
  }),
  streak: protectedProcedure.query(async ({ctx}) =>{
    const result = await ctx.db.select({
      date: sql<string>`date(${pomodoroSession.completedAt})`.as("date"),
    }).from(pomodoroSession).where(
      and(
        eq(pomodoroSession.userId, ctx.user.id),
        eq(pomodoroSession.type, "work"),
      )
    ).groupBy(sql`date(${pomodoroSession.completedAt})`)
    .orderBy(sql`date(${pomodoroSession.completedAt}) desc`);

    if(result.length === 0) return 0;

    let streak = 0;
    const today = utcTodayStart();

    for(let i = 0; i < result.length; ++i) {
      const expectedDate = new Date(today);
      expectedDate.setUTCDate(expectedDate.getUTCDate() - i);
      const expectedStr = utcDateString(expectedDate);

      if(result[i].date === expectedStr) {
        ++streak;
      } else {
        break;
      }
    }

    return streak;
  }),
});