import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const pdfStatusEnum = pgEnum('pdf_status', [
  'uploaded',
  'queued',
  'processing',
  'review_ready',
  'completed',
  'failed'
]);

export const pdfDocuments = pgTable('pdf_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  totalQuestionsDetected: integer('total_questions_detected').default(0),
  totalQuestionsApproved: integer('total_questions_approved').default(0),
  status: pdfStatusEnum('status').default('uploaded').notNull(),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').$type<{
    targetSubject?: string;
    sourceYear?: number;
    pageCount?: number;
    extractedAt?: string;
    pdfType?: 'TYPE_A' | 'TYPE_B' | 'TYPE_C';
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
