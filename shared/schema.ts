import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isArtist: boolean("is_artist").default(false),
  walletAddress: text("wallet_address"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Artists table - extends users with artist-specific information
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  genres: text("genres").array(),
  location: text("location"),
  bannerImage: text("banner_image"),
  tokenName: text("token_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenSupply: integer("token_supply").notNull(),
  artistShare: real("artist_share").notNull(), // percentage
  tokenHolderShare: real("token_holder_share").notNull(), // percentage
  treasuryShare: real("treasury_share").notNull(), // percentage
  contractAddress: text("contract_address"),
});

// Tokens table - represents token holdings
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  txHash: text("tx_hash"),  // Transaction hash for blockchain or Stripe session ID
  method: text("method"),   // 'crypto' or 'usd'
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

// Proposals table - for governance
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // creative, business, release, partnership, treasury
  options: json("options").notNull(), // Array of options
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active"), // active, completed, cancelled
});

// Votes table
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id),
  userId: integer("user_id").notNull().references(() => users.id),
  optionIndex: integer("option_index").notNull(),
  weight: real("weight").notNull(), // based on token holdings
  timestamp: timestamp("timestamp").defaultNow(),
});

// Revenue table
export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull().references(() => artists.id),
  amount: real("amount").notNull(),
  source: text("source").notNull(), // streaming, merchandise, licensing, etc.
  date: timestamp("date").defaultNow(),
  distributed: boolean("distributed").default(false),
});

// Earnings table - tracks distributed earnings
export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  revenueId: integer("revenue_id").notNull().references(() => revenues.id),
  userId: integer("user_id").references(() => users.id),
  artistId: integer("artist_id").references(() => artists.id),
  treasuryId: integer("treasury_id"),
  amount: real("amount").notNull(),
  date: timestamp("date").defaultNow(),
  type: text("type").notNull(), // artist, tokenHolder, treasury
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  purchaseDate: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  startDate: true,
  status: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  timestamp: true,
});

export const insertRevenueSchema = createInsertSchema(revenues).omit({
  id: true,
  date: true,
  distributed: true,
});

export const insertEarningSchema = createInsertSchema(earnings).omit({
  id: true,
  date: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type Revenue = typeof revenues.$inferSelect;

export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earnings.$inferSelect;
