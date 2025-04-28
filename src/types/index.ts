
export type UserRole = 'librarian' | 'member';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publicationYear: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
}

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  booksBorrowed: number;
  overdueBooks: number;
}
