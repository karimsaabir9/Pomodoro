import z from "zod";

import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { task } from "@/db/schema";
import { DEFAULT_TASK_INFO } from "@/lib/constants";

export const tasksRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ctx}) => {
    return ctx.db.query.task.findMany({
      where: eq(task.userId, ctx.user.id),
      orderBy: [asc(task.sortOrder)],
    });
  }),
  create: protectedProcedure.input(
    z.object({
      title: z.string().min(DEFAULT_TASK_INFO.minTaskLength).max(DEFAULT_TASK_INFO.maxTaskLength),
      estimatedPomodoros: z.number().min(DEFAULT_TASK_INFO.minPomodoros).max(DEFAULT_TASK_INFO.maxPomodoros).default(DEFAULT_TASK_INFO.defaultEstPomodoros),
    }),
  ).mutation(async ({ctx, input}) => {
    const maxResult = await ctx.db.select({
      maxSort: sql<number>`coalesce(max(${task.sortOrder}), 0)`
    }).from(task).where(eq(task.userId, ctx.user.id));

    const [created] = await ctx.db.insert(task).values({
      id: crypto.randomUUID(),
      userId: ctx.user.id,
      title: input.title,
      estimatedPomodoros: input.estimatedPomodoros,
      sortOrder: (maxResult[0]?.maxSort ?? 0) + 1,
    }).returning();
    return created;
  }),
  update: protectedProcedure.input(
    z.object({
      id: z.string(),
      title: z.string().min(DEFAULT_TASK_INFO.minTaskLength).max(DEFAULT_TASK_INFO.maxTaskLength).optional(),
      estimatedPomodoros: z.number().min(DEFAULT_TASK_INFO.minPomodoros).max(DEFAULT_TASK_INFO.maxPomodoros).optional(),
      isCompleted: z.boolean().optional(),
    })
  ).mutation(async ({ctx, input}) => {
    const {id, ...data} = input;

    const [updated] = await ctx.db.update(task).set({
      ...data,
      updatedAt: new Date()
    }).where(and(eq(task.id, id), eq(task.userId, ctx.user.id))).returning();
    return updated;
  }),
  reorder: protectedProcedure.input(z.array(z.object({
    id: z.string(),
    sortOrder: z.number(),
  }))).mutation(async ({ctx, input}) => {
    if(input.length === 0) return;

    const ids = input.map(i => i.id);

    const cases = sql.join(
      input.map(i => sql`when ${task.id} = ${i.id} then ${i.sortOrder}::int`),
      sql.raw(" "),
    );

    await ctx.db.update(task).set({
      sortOrder: sql`case ${cases} end`,
      updatedAt: new Date(),
    }).where(and(eq(task.userId, ctx.user.id), inArray(task.id, ids)));
  }),
  delete: protectedProcedure.input(z.object({
    id: z.string()
  })).mutation(async ({ctx, input}) => {
    await ctx.db.delete(task).where(and(eq(task.id, input.id), eq(task.userId, ctx.user.id)))
  }),
  incrementPomodoro: protectedProcedure.input(z.object({
    id: z.string()
  })).mutation(async ({ctx, input}) => {
    const [updated] = await ctx.db.update(task).set({
      actualPomodoros: sql`${task.actualPomodoros} + 1`,
      updatedAt: new Date(),
    }).where(and(eq(task.id, input.id), eq(task.userId, ctx.user.id))).returning();

    return updated;
  }),
});