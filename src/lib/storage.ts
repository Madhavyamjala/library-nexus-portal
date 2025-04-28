
import { Book, Member, BorrowRecord, User } from '@/types';

// Default users
const defaultUsers: User[] = [
  { 
    id: '1', 
    username: 'librarian', 
    password: 'lib123', 
    role: 'librarian',
    name: 'Head Librarian'
  },
  { 
    id: '2', 
    username: 'member', 
    password: 'mem123', 
    role: 'member',
    name: 'John Doe'
  },
];

// Default books
const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    genre: 'Fiction',
    publicationYear: 1960,
    totalQuantity: 5,
    availableQuantity: 3
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    genre: 'Science Fiction',
    publicationYear: 1949,
    totalQuantity: 7,
    availableQuantity: 5
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    genre: 'Fiction',
    publicationYear: 1925,
    totalQuantity: 4,
    availableQuantity: 4
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    genre: 'Romance',
    publicationYear: 1813,
    totalQuantity: 3,
    availableQuantity: 1
  },
  {
    id: '5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '9780547928227',
    genre: 'Fantasy',
    publicationYear: 1937,
    totalQuantity: 8,
    availableQuantity: 6
  },
];

// Default members
const defaultMembers: Member[] = [
  { 
    id: 'M001', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '555-1234' 
  },
  { 
    id: 'M002', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '555-5678' 
  },
  { 
    id: 'M003', 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    phone: '555-9012' 
  }
];

// Default borrow records
const defaultBorrowRecords: BorrowRecord[] = [
  {
    id: 'BR001',
    bookId: '1',
    memberId: 'M001',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'BR002',
    bookId: '2',
    memberId: 'M002',
    issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'BR003',
    bookId: '4',
    memberId: 'M003',
    issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Storage keys
const STORAGE_KEYS = {
  USERS: 'library_users',
  BOOKS: 'library_books',
  MEMBERS: 'library_members',
  BORROW_RECORDS: 'library_borrow_records',
};

// Initialize storage with default data if empty
export const initializeStorage = () => {
  // Initialize users
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize books
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(defaultBooks));
  }

  // Initialize members
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(defaultMembers));
  }

  // Initialize borrow records
  if (!localStorage.getItem(STORAGE_KEYS.BORROW_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(defaultBorrowRecords));
  }
};

// Generic getter for any storage key
export const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Generic setter for any storage key
export const setToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User-specific functions
export const getUsers = (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS);

export const setUsers = (users: User[]): void => 
  setToStorage(STORAGE_KEYS.USERS, users);

export const findUser = (username: string, password: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.username === username && user.password === password);
};

// Book-specific functions
export const getBooks = (): Book[] => getFromStorage<Book>(STORAGE_KEYS.BOOKS);

export const setBooks = (books: Book[]): void => 
  setToStorage(STORAGE_KEYS.BOOKS, books);

export const addBook = (book: Book): void => {
  const books = getBooks();
  books.push(book);
  setBooks(books);
};

export const updateBook = (book: Book): void => {
  const books = getBooks();
  const index = books.findIndex(b => b.id === book.id);
  if (index !== -1) {
    books[index] = book;
    setBooks(books);
  }
};

export const deleteBook = (id: string): boolean => {
  // Check if book is borrowed
  const borrowRecords = getBorrowRecords().filter(
    record => record.bookId === id && !record.returnDate
  );
  
  // Can't delete if book is borrowed
  if (borrowRecords.length > 0) return false;
  
  const books = getBooks();
  const filteredBooks = books.filter(book => book.id !== id);
  setBooks(filteredBooks);
  return true;
};

export const getBookById = (id: string): Book | undefined => {
  const books = getBooks();
  return books.find(book => book.id === id);
};

// Member-specific functions
export const getMembers = (): Member[] => getFromStorage<Member>(STORAGE_KEYS.MEMBERS);

export const setMembers = (members: Member[]): void => 
  setToStorage(STORAGE_KEYS.MEMBERS, members);

export const addMember = (member: Member): void => {
  const members = getMembers();
  members.push(member);
  setMembers(members);
};

export const updateMember = (member: Member): void => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index !== -1) {
    members[index] = member;
    setMembers(members);
  }
};

export const deleteMember = (id: string): boolean => {
  // Check if member has borrowed books
  const borrowRecords = getBorrowRecords().filter(
    record => record.memberId === id && !record.returnDate
  );
  
  // Can't delete if member has borrowed books
  if (borrowRecords.length > 0) return false;
  
  const members = getMembers();
  const filteredMembers = members.filter(member => member.id !== id);
  setMembers(filteredMembers);
  return true;
};

export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find(member => member.id === id);
};

// Borrow records functions
export const getBorrowRecords = (): BorrowRecord[] => 
  getFromStorage<BorrowRecord>(STORAGE_KEYS.BORROW_RECORDS);

export const setBorrowRecords = (records: BorrowRecord[]): void => 
  setToStorage(STORAGE_KEYS.BORROW_RECORDS, records);

export const addBorrowRecord = (record: BorrowRecord): void => {
  const records = getBorrowRecords();
  records.push(record);
  setBorrowRecords(records);
  
  // Update book available quantity
  const books = getBooks();
  const bookIndex = books.findIndex(b => b.id === record.bookId);
  if (bookIndex !== -1 && books[bookIndex].availableQuantity > 0) {
    books[bookIndex].availableQuantity -= 1;
    setBooks(books);
  }
};

export const returnBook = (recordId: string, returnDate: string): number | null => {
  const records = getBorrowRecords();
  const recordIndex = records.findIndex(r => r.id === recordId);
  
  if (recordIndex === -1) return null;
  
  const record = records[recordIndex];
  
  // Book is already returned
  if (record.returnDate) return null;
  
  // Calculate fine if overdue
  let fine = 0;
  const dueDate = new Date(record.dueDate);
  const actualReturn = new Date(returnDate);
  
  if (actualReturn > dueDate) {
    // $1 per day overdue
    const daysOverdue = Math.ceil((actualReturn.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    fine = daysOverdue;
  }
  
  // Update record
  records[recordIndex] = {
    ...record,
    returnDate,
    fine: fine > 0 ? fine : undefined
  };
  
  setBorrowRecords(records);
  
  // Update book available quantity
  const books = getBooks();
  const bookIndex = books.findIndex(b => b.id === record.bookId);
  if (bookIndex !== -1) {
    books[bookIndex].availableQuantity += 1;
    setBooks(books);
  }
  
  return fine > 0 ? fine : 0;
};

export const KEYS = STORAGE_KEYS;
