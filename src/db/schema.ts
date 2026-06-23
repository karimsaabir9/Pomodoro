import { boolean, pgTable, timestamp, text, integer, index, uniqueIndex } from "drizzle-orm/pg-core";

import { DEFAULT_SETTINGS } from "@/lib/constants";
// =============================================================================
// BETTER AUTH SCHEMA - Required tables for Better Auth to function
// =============================================================================
//
// WHY: Better Auth needs these tables to store users, sessions, accounts, and
// verification tokens. Unlike NextAuth, Better Auth uses a more explicit schema.
//
// TABLES:
//   - user: Core user data (id, name, email, image)
//   - session: Active sessions with tokens and expiry
//   - account: OAuth provider connections (GitHub, Google, etc.)
//   - verification: Email verification and password reset tokens
//
// DRIZZLE NOTES:
//   - Using pgTable for Postgres-specific types
//   - text() for strings (Postgres text type, no length limit)
//   - timestamp() for dates (Postgres timestamp type)
//   - References use onDelete: 'cascade' to clean up related records
// =============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});


export const userSetting = pgTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade"}),
  workDuration: integer("work_duration").notNull().default(DEFAULT_SETTINGS.workDuration),
  shortBreakDuration: integer("short_break_duration").notNull().default(DEFAULT_SETTINGS.shortBreakDuration),
  longBreakDuration: integer("long_break_duration").notNull().default(DEFAULT_SETTINGS.longBreakDuration),
  sessionsBeforeLongBreak: integer("sessions_before_long_break").notNull().default(DEFAULT_SETTINGS.sessionsBeforeLongBreak),
  soundEnabled: boolean("sound_enabled").notNull().default(DEFAULT_SETTINGS.soundEnabled),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(DEFAULT_SETTINGS.notificationsEnabled),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const task = pgTable("task", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  estimatedPomodoros: integer("estimated_pomodoros").notNull().default(1),
  actualPomodoros: integer("actual_pomodoros").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("task_user_completed_sort_idx").on(table.userId, table.isCompleted, table.sortOrder),
]);

export const pomodoroSession = pgTable("pomodoro_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => task.id, { onDelete: "set null" }),
  duration: integer("duration").notNull(),
  type: text("type").notNull(), // "work" | "short_break" | "long_break"
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("pomodoro_session_user_completed_idx").on(table.userId, table.completedAt),
]);

export const pomodoroStats = pgTable("pomodoro_stats", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  completedPomodoros: integer("completed_pomodoros").notNull().default(0),
  totalFocusTime: integer("total_focus_time").notNull().default(0), // seconds
  totalBreakTime: integer("total_break_time").notNull().default(0), // seconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("pomodoro_stats_user_date_idx").on(table.userId, table.date),
]);