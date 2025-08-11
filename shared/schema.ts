import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  team: text("team").notNull(),
  nationality: text("nationality").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const races = pgTable("races", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  weather: text("weather"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const raceResults = pgTable("race_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  raceId: varchar("race_id").references(() => races.id).notNull(),
  driverId: varchar("driver_id").references(() => drivers.id).notNull(),
  position: integer("position"),
  status: text("status").notNull().default("finished"), // finished, dnf, dsq
  basePoints: integer("base_points").default(0).notNull(),
  bonusPoints: integer("bonus_points").default(0).notNull(),
  penaltyPoints: integer("penalty_points").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pointsConfiguration = pgTable("points_configuration", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isActive: integer("is_active").default(0).notNull(),
  positionPoints: json("position_points").notNull().$type<number[]>(),
  bonusRules: json("bonus_rules").notNull().$type<{
    fastestLap: number;
    polePosition: number;
    mostOvertakes: number;
  }>(),
  penaltyRules: json("penalty_rules").notNull().$type<{
    racingIncident: number;
    trackLimits: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
});

export const insertRaceSchema = z.object({
  name: z.string().min(1),
  date: z.string().or(z.date()),
  weather: z.string().nullable().optional(),
});

export const insertRaceResultSchema = createInsertSchema(raceResults).omit({
  id: true,
  createdAt: true,
  totalPoints: true,
});

export const insertPointsConfigurationSchema = createInsertSchema(pointsConfiguration).omit({
  id: true,
  createdAt: true,
});

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export type InsertRace = z.infer<typeof insertRaceSchema>;
export type Race = typeof races.$inferSelect;

export type InsertRaceResult = z.infer<typeof insertRaceResultSchema>;
export type RaceResult = typeof raceResults.$inferSelect;

export type InsertPointsConfiguration = z.infer<typeof insertPointsConfigurationSchema>;
export type PointsConfiguration = typeof pointsConfiguration.$inferSelect;

export type RaceResultWithDetails = RaceResult & {
  driver: Driver;
  race: Race;
};

export type ChampionshipStanding = {
  driver: Driver;
  totalPoints: number;
  position: number;
  races: number;
};
