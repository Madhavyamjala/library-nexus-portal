
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, BookOpen, User, Calendar } from 'lucide-react';
import { BorrowRecord, Book, Member } from '@/types';
import { 
  getBooks, 
  getMembers, 
  getBorrowRecords, 
  addBorrowRecord, 
  returnBook, 
  getBookById,
  getMemberById
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parseISO } from 'date-fns';

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), 'MMM dd, yyyy');
};

const BorrowForm: React.FC<{
  onSave: (record: BorrowRecord) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), 14), 'yyyy-MM-dd')
  );
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load books and members
  useEffect(() => {
    const allBooks = getBooks().filter(book => book.availableQuantity > 0);
    const allMembers = getMembers();
    setBooks(allBooks);
    setMembers(allMembers);
  }, []);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bookId) newErrors.bookId = 'Please select a book';
    if (!memberId) newErrors.memberId = 'Please select a member';
    if (!dueDate) newErrors.dueDate = 'Please set a due date';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const record: BorrowRecord = {
      id: `BR${String(Date.now()).slice(-6)}`,
      bookId,
      memberId,
      issueDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
    };
    
    onSave(record);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="book">Book</Label>
        <Select value={bookId} onValueChange={setBookId}>
          <SelectTrigger id="book" className={errors.bookId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a book" />
          </SelectTrigger>
          <SelectContent>
            {books.length === 0 ? (
              <SelectItem value="" disabled>No books available</SelectItem>
            ) : (
              books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title} by {book.author} ({book.availableQuantity} available)
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.bookId && <p className="text-red-500 text-xs">{errors.bookId}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="member">Member</Label>
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger id="member" className={errors.memberId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a member" />
          </SelectTrigger>
          <SelectContent>
            {members.length === 0 ? (
              <SelectItem value="" disabled>No members available</SelectItem>
            ) : (
              members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} ({member.id})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.memberId && <p className="text-red-500 text-xs">{errors.memberId}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
          className={errors.dueDate ? 'border-red-500' : ''}
        />
        {errors.dueDate && <p className="text-red-500 text-xs">{errors.dueDate}</p>}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Issue Book
        </Button>
      </div>
    </form>
  );
};

const ReturnForm: React.FC<{
  onReturn: (recordId: string) => void;
  onClose: () => void;
}> = ({ onReturn, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<Array<BorrowRecord & { bookTitle: string; memberName: string }>>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  // Load active borrow records
  useEffect(() => {
    loadRecords();
  }, [searchTerm]);
  
  const loadRecords = () => {
    const borrowRecords = getBorrowRecords().filter(record => !record.returnDate);
    const term = searchTerm.toLowerCase();
    
    const enrichedRecords = borrowRecords
      .map(record => {
        const book = getBookById(record.bookId);
        const member = getMemberById(record.memberId);
        return {
          ...record,
          bookTitle: book?.title || 'Unknown Book',
          memberName: member?.name || 'Unknown Member',
        };
      })
      .filter(record => {
        if (!term) return true;
        
        return (
          record.bookTitle.toLowerCase().includes(term) ||
          record.memberName.toLowerCase().includes(term) ||
          record.bookId.toLowerCase().includes(term) ||
          record.memberId.toLowerCase().includes(term)
        );
      });
    
    setRecords(enrichedRecords);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRecordId) return;
    
    onReturn(selectedRecordId);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Borrowed Books</Label>
        <Input
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by book title, member name, or ID"
        />
      </div>
      
      <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No borrowed books found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => {
                const isOverdue = new Date(record.dueDate) < new Date();
                
                return (
                  <TableRow 
                    key={record.id} 
                    className={
                      selectedRecordId === record.id 
                        ? "bg-primary/10" 
                        : isOverdue 
                          ? "bg-red-50" 
                          : undefined
                    }
                    onClick={() => setSelectedRecordId(record.id)}
                  >
                    <TableCell>
                      <input
                        type="radio"
                        checked={selectedRecordId === record.id}
                        onChange={() => setSelectedRecordId(record.id)}
                      />
                    </TableCell>
                    <TableCell>{record.bookTitle}</TableCell>
                    <TableCell>{record.memberName}</TableCell>
                    <TableCell>{formatDate(record.issueDate)}</TableCell>
                    <TableCell className={isOverdue ? "text-red-500 font-medium" : ""}>
                      {formatDate(record.dueDate)}
                      {isOverdue && " (Overdue)"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedRecordId}>
          Return Book
        </Button>
      </div>
    </form>
  );
};

const Borrowing: React.FC = () => {
  const [records, setRecords] = useState<Array<BorrowRecord & { 
    bookTitle: string; 
    memberName: string;
  }>>([]);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [fineDialogInfo, setFineDialogInfo] = useState<{ amount: number; isOpen: boolean }>({
    amount: 0,
    isOpen: false,
  });
  const { toast } = useToast();
  
  // Load borrow records
  useEffect(() => {
    loadRecords();
  }, []);
  
  const loadRecords = () => {
    const borrowRecords = getBorrowRecords();
    
    const enrichedRecords = borrowRecords
      .filter(record => !record.returnDate) // Only show currently borrowed books
      .map(record => {
        const book = getBookById(record.bookId);
        const member = getMemberById(record.memberId);
        return {
          ...record,
          bookTitle: book?.title || 'Unknown Book',
          memberName: member?.name || 'Unknown Member',
        };
      });
    
    setRecords(enrichedRecords);
  };
  
  // Handle issuing a book
  const handleBorrowBook = (record: BorrowRecord) => {
    addBorrowRecord(record);
    
    const book = getBookById(record.bookId);
    const member = getMemberById(record.memberId);
    
    toast({
      title: "Book Issued",
      description: `${book?.title} has been issued to ${member?.name}.`,
    });
    
    setIsBorrowDialogOpen(false);
    loadRecords();
  };
  
  // Handle returning a book
  const handleReturnBook = (recordId: string) => {
    const fine = returnBook(recordId, new Date().toISOString());
    
    if (fine !== null) {
      if (fine > 0) {
        setFineDialogInfo({
          amount: fine,
          isOpen: true,
        });
      } else {
        toast({
          title: "Book Returned",
          description: "The book has been returned successfully. No fine due.",
        });
      }
    }
    
    setIsReturnDialogOpen(false);
    loadRecords();
  };
  
  return (
    <Layout title="Borrowing">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Book Borrowing</h2>
        
        <div className="flex space-x-4">
          <Button onClick={() => setIsBorrowDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Issue Book
          </Button>
          <Button variant="outline" onClick={() => setIsReturnDialogOpen(true)}>
            Return Book
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Currently Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No borrowed books.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => {
                    const isOverdue = new Date(record.dueDate) < new Date();
                    
                    return (
                      <TableRow key={record.id} className={isOverdue ? "bg-red-50" : undefined}>
                        <TableCell className="font-medium">{record.bookTitle}</TableCell>
                        <TableCell>{record.bookId}</TableCell>
                        <TableCell>{record.memberName} ({record.memberId})</TableCell>
                        <TableCell>{formatDate(record.issueDate)}</TableCell>
                        <TableCell>{formatDate(record.dueDate)}</TableCell>
                        <TableCell className={isOverdue ? "text-red-500 font-medium" : "text-green-600"}>
                          {isOverdue ? "Overdue" : "On Time"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Issue Book Dialog */}
      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue a Book</DialogTitle>
          </DialogHeader>
          <BorrowForm
            onSave={handleBorrowBook}
            onClose={() => setIsBorrowDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Return Book Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return a Book</DialogTitle>
          </DialogHeader>
          <ReturnForm
            onReturn={handleReturnBook}
            onClose={() => setIsReturnDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Fine Dialog */}
      <Dialog open={fineDialogInfo.isOpen} onOpenChange={(open) => setFineDialogInfo({ ...fineDialogInfo, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Returned - Fine Due</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-4">
            <div className="text-4xl font-bold text-destructive">${fineDialogInfo.amount.toFixed(2)}</div>
            <p>This book was returned after the due date. A fine of ${fineDialogInfo.amount.toFixed(2)} is due.</p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setFineDialogInfo({ amount: 0, isOpen: false })}>
              Acknowledge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Borrowing;
