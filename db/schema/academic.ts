import { pgTable, uuid, varchar, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // 'Physics', 'Chemistry', 'Botany', 'Zoology'
  code: varchar('code', { length: 20 }).notNull().unique(), // 'PHY', 'CHEM', 'BOT', 'ZOO'
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  classLevel: integer('class_level').notNull().default(11), // 11 or 12
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  subjectIdx: index('chapters_subject_id_idx').on(table.subjectId),
  subjectSlugUnique: uniqueIndex('chapters_subject_slug_idx').on(table.subjectId, table.slug),
}));

export const topics = pgTable('topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  chapterId: uuid('chapter_id').references(() => chapters.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  chapterIdx: index('topics_chapter_id_idx').on(table.chapterId),
  chapterSlugUnique: uniqueIndex('topics_chapter_slug_idx').on(table.chapterId, table.slug),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [chapters.subjectId],
    references: [subjects.id],
  }),
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one }) => ({
  chapter: one(chapters, {
    fields: [topics.chapterId],
    references: [chapters.id],
  }),
}));
