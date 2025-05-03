
import { Database } from '@/integrations/supabase/types';

// Derived types from the Supabase schema
export type BookRow = Database['public']['Tables']['books']['Row'];
export type MemberRow = Database['public']['Tables']['members']['Row'];
export type BorrowRecordRow = Database['public']['Tables']['borrow_records']['Row'];

// Insert types
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type BorrowRecordInsert = Database['public']['Tables']['borrow_records']['Insert'];

// Update types
export type BookUpdate = Database['public']['Tables']['books']['Update'];
export type MemberUpdate = Database['public']['Tables']['members']['Update'];
export type BorrowRecordUpdate = Database['public']['Tables']['borrow_records']['Update'];

// Convert snake_case database columns to camelCase for frontend use
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publicationYear: number;
  totalQuantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  createdAt: string;
  updatedAt: string;
}

// Utility functions to convert between database and frontend formats
export const convertBookRowToBook = (row: BookRow): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  isbn: row.isbn,
  genre: row.genre,
  publicationYear: row.publication_year,
  totalQuantity: row.total_quantity,
  availableQuantity: row.available_quantity,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const convertMemberRowToMember = (row: MemberRow): Member => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const convertBorrowRecordRowToBorrowRecord = (row: BorrowRecordRow): BorrowRecord => ({
  id: row.id,
  bookId: row.book_id,
  memberId: row.member_id,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  returnDate: row.return_date || undefined,
  fine: row.fine !== null ? Number(row.fine) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Utility functions for converting from frontend format to database insert/update formats
export const convertToBookInsert = (book: Partial<Book>): BookInsert => ({
  title: book.title!,
  author: book.author!,
  isbn: book.isbn!,
  genre: book.genre!,
  publication_year: book.publicationYear!,
  total_quantity: book.totalQuantity,
  available_quantity: book.availableQuantity
});

export const convertToMemberInsert = (member: Partial<Member>): MemberInsert => ({
  name: member.name!,
  email: member.email!,
  phone: member.phone
});

export const convertToBorrowRecordInsert = (record: Partial<BorrowRecord>): BorrowRecordInsert => ({
  book_id: record.bookId!,
  member_id: record.memberId!,
  due_date: record.dueDate!,
  issue_date: record.issueDate,
  return_date: record.returnDate,
  fine: record.fine
});
