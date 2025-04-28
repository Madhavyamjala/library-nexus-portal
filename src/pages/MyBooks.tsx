
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { BorrowRecord, Book } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getBorrowRecords, getBookById } from '@/lib/storage';
import { ClipboardList } from 'lucide-react';

interface EnrichedBorrowRecord extends BorrowRecord {
  bookTitle: string;
  bookAuthor: string;
}

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'MMM dd, yyyy');
};

const MyBooks: React.FC = () => {
  const { user } = useAuth();
  const [currentBooks, setCurrentBooks] = useState<EnrichedBorrowRecord[]>([]);
  const [historicalBooks, setHistoricalBooks] = useState<EnrichedBorrowRecord[]>([]);
  
  // Load borrowed books for the current user
  useEffect(() => {
    if (!user) return;
    
    const borrowRecords = getBorrowRecords();
    const memberRecords = borrowRecords.filter(record => record.memberId === user.id);
    
    // Enrich records with book details
    const enrichedRecords = memberRecords.map(record => {
      const book = getBookById(record.bookId);
      return {
        ...record,
        bookTitle: book?.title || 'Unknown Book',
        bookAuthor: book?.author || 'Unknown Author',
      };
    });
    
    // Split into current and historical
    const current = enrichedRecords.filter(record => !record.returnDate);
    const historical = enrichedRecords.filter(record => record.returnDate);
    
    setCurrentBooks(current);
    setHistoricalBooks(historical);
    
  }, [user]);
  
  return (
    <Layout title="My Books">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">My Borrowed Books</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Currently Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            {currentBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You don't have any books checked out at the moment.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed On</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBooks.map((book) => {
                    const isOverdue = new Date(book.dueDate) < new Date();
                    return (
                      <TableRow key={book.id} className={isOverdue ? "bg-red-50" : undefined}>
                        <TableCell className="font-medium">{book.bookTitle}</TableCell>
                        <TableCell>{book.bookAuthor}</TableCell>
                        <TableCell>{formatDate(book.issueDate)}</TableCell>
                        <TableCell>{formatDate(book.dueDate)}</TableCell>
                        <TableCell className={isOverdue ? "text-red-500 font-medium" : "text-green-600"}>
                          {isOverdue ? "Overdue" : "On Time"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {historicalBooks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Borrowing History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed On</TableHead>
                    <TableHead>Returned On</TableHead>
                    <TableHead>Fine</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.bookTitle}</TableCell>
                      <TableCell>{book.bookAuthor}</TableCell>
                      <TableCell>{formatDate(book.issueDate)}</TableCell>
                      <TableCell>{book.returnDate ? formatDate(book.returnDate) : '-'}</TableCell>
                      <TableCell>
                        {book.fine ? `$${book.fine.toFixed(2)}` : 'None'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MyBooks;
