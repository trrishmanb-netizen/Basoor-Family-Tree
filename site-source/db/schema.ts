import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordSalt: text("password_salt").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull().default("active"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  failedCount: integer("failed_count").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at"),
});

export const profileOverrides = sqliteTable("profile_overrides", {
  memberId: text("member_id").primaryKey(),
  name: text("name"),
  bio: text("bio"),
  city: text("city"),
  gender: text("gender"),
  birthDate: text("birth_date"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  photoKey: text("photo_key"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  eventDate: text("event_date").notNull(),
  description: text("description").notNull(),
  authorName: text("author_name").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const gallery = sqliteTable("gallery", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  objectKey: text("object_key").notNull(),
  uploaderId: text("uploader_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contactRequests = sqliteTable("contact_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  memberId: text("member_id"),
  message: text("message").notNull(),
  emailStatus: text("email_status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const extraPeople = sqliteTable("extra_people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gen: integer("gen").notNull(),
  parentId: text("parent_id"),
  partnerOf: text("partner_of"),
  deceased: integer("deceased", { mode: "boolean" }).notNull().default(false),
  gender: text("gender").notNull().default("neutral"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
