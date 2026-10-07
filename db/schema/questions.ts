import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { subjects, chapters, topics } from './academic';

export const questionDifficultyEnum = pgEnum('question_difficulty', ['easy', 'medium', 'hard']);
export const questionStatusEnum = pgEnum('question_status', ['draft', 'review', 'approved', 'rejected', 'archived']);
export const imagePositionEnum = pgEnum('image_position', ['question', 'explanation']);

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionText: text('question_text').notNull(),
  subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'restrict' }).notNull(),
  chapterId: uuid('chapter_id').references(() => chapters.id, { onDelete: 'restrict' }).notNull(),
  topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  difficulty: questionDifficultyEnum('difficulty').default('medium').notNull(),
  explanation: text('explanation'),
  correctOption: varchar('correct_option', { length: 5 }).notNull(), // 'A' | 'B' | 'C' | 'D'
  source: varchar('source', { length: 100 }).default('Internal'),
  sourceYear: integer('source_year'),
  status: questionStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  subjectIdx: index('questions_subject_id_idx').on(table.subjectId),
  chapterIdx: index('questions_chapter_id_idx').on(table.chapterId),
  topicIdx: index('questions_topic_id_idx').on(table.topicId),
  statusIdx: index('questions_status_idx').on(table.status),
  difficultyIdx: index('questions_difficulty_idx').on(table.difficulty),
  sourceYearIdx: index('questions_source_year_idx').on(table.source, table.sourceYear),
}));

export const questionOptions = pgTable('question_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  optionKey: varchar('option_key', { length: 5 }).notNull(), // 'A', 'B', 'C', 'D'
  optionText: text('option_text').notNull(),
  optionImageUrl: text('option_image_url'),
  displayOrder: integer('display_order').notNull().default(0),
}, (table) => ({
  questionIdx: index('question_options_question_id_idx').on(table.questionId),
}));

export const questionImages = pgTable('question_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  caption: varchar('caption', { length: 255 }),
  position: imagePositionEnum('position').default('question').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
});

export const questionTags = pgTable('question_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  tagName: varchar('tag_name', { length: 100 }).notNull(),
}, (table) => ({
  questionIdx: index('question_tags_question_id_idx').on(table.questionId),
  tagIdx: index('question_tags_tag_name_idx').on(table.tagName),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  subject: one(subjects, { fields: [questions.subjectId], references: [subjects.id] }),
  chapter: one(chapters, { fields: [questions.chapterId], references: [chapters.id] }),
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
  options: many(questionOptions),
  images: many(questionImages),
  tags: many(questionTags),
}));
