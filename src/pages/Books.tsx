
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Book } from '@/types';
import { getBooks, addBook, updateBook, deleteBook } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const BookForm: React.FC<{
  book?: Book;
  onSave: (book: Book) => void;
  onClose: () => void;
}> = ({ book, onSave, onClose }) => {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [isbn, setIsbn] = useState(book?.isbn || '');
  const [genre, setGenre] = useState(book?.genre || '');
  const [publicationYear, setPublicationYear] = useState(book?.publicationYear?.toString() || '');
  const [totalQuantity, setTotalQuantity] = useState(book?.totalQuantity?.toString() || '1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title) newErrors.title = 'Title is required';
    if (!author) newErrors.author = 'Author is required';
    if (!isbn) newErrors.isbn = 'ISBN is required';
    if (!genre) newErrors.genre = 'Genre is required';
    if (!publicationYear) {
      newErrors.publicationYear = 'Publication year is required';
    } else if (isNaN(Number(publicationYear)) || Number(publicationYear) < 0) {
      newErrors.publicationYear = 'Publication year must be a valid number';
    }
    
    if (!totalQuantity) {
      newErrors.totalQuantity = 'Total quantity is required';
    } else if (isNaN(Number(totalQuantity)) || Number(totalQuantity) < 1) {
      newErrors.totalQuantity = 'Total quantity must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const newBook: Book = {
      id: book?.id || crypto.randomUUID(),
      title,
      author,
      isbn,
      genre,
      publicationYear: Number(publicationYear),
      totalQuantity: Number(totalQuantity),
      availableQuantity: book ? book.availableQuantity : Number(totalQuantity),
    };
    
    onSave(newBook);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className={errors.author ? 'border-red-500' : ''}
          />
          {errors.author && <p className="text-red-500 text-xs">{errors.author}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="ISBN"
            disabled={!!book} // Disable ISBN editing for existing books
            className={errors.isbn ? 'border-red-500' : ''}
          />
          {errors.isbn && <p className="text-red-500 text-xs">{errors.isbn}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Book genre"
            className={errors.genre ? 'border-red-500' : ''}
          />
          {errors.genre && <p className="text-red-500 text-xs">{errors.genre}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="publicationYear">Publication Year</Label>
          <Input
            id="publicationYear"
            type="number"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            placeholder="Publication year"
            className={errors.publicationYear ? 'border-red-500' : ''}
          />
          {errors.publicationYear && <p className="text-red-500 text-xs">{errors.publicationYear}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="totalQuantity">Total Quantity</Label>
          <Input
            id="totalQuantity"
            type="number"
            value={totalQuantity}
            onChange={(e) => setTotalQuantity(e.target.value)}
            placeholder="Total copies"
            className={errors.totalQuantity ? 'border-red-500' : ''}
            min="1"
          />
          {errors.totalQuantity && <p className="text-red-500 text-xs">{errors.totalQuantity}</p>}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {book ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { role } = useAuth();
  
  const isLibrarian = role === 'librarian';
  
  // Load books
  useEffect(() => {
    loadBooks();
  }, []);
  
  const loadBooks = () => {
    const allBooks = getBooks();
    setBooks(allBooks);
  };
  
  // Filter books based on search term
  const filteredBooks = books.filter(book => {
    const term = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.isbn.toLowerCase().includes(term)
    );
  });
  
  // Handle book save (add or update)
  const handleSaveBook = (book: Book) => {
    if (selectedBook) {
      updateBook(book);
      toast({
        title: "Book Updated",
        description: `${book.title} has been updated successfully.`,
      });
    } else {
      addBook(book);
      toast({
        title: "Book Added",
        description: `${book.title} has been added to the catalog.`,
      });
    }
    
    loadBooks();
    setIsFormOpen(false);
    setSelectedBook(undefined);
  };
  
  // Handle book delete
  const handleDeleteBook = () => {
    if (!selectedBook) return;
    
    const success = deleteBook(selectedBook.id);
    
    if (success) {
      toast({
        title: "Book Deleted",
        description: `${selectedBook.title} has been deleted from the catalog.`,
      });
      loadBooks();
    } else {
      toast({
        title: "Cannot Delete Book",
        description: "This book cannot be deleted because it is currently borrowed.",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedBook(undefined);
  };
  
  return (
    <Layout title="Books">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Books Catalog</h2>
          {isLibrarian && (
            <Button onClick={() => { setSelectedBook(undefined); setIsFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Book
            </Button>
          )}
        </div>
        
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Book Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Available / Total</TableHead>
                    {isLibrarian && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isLibrarian ? 7 : 6} className="text-center h-24 text-muted-foreground">
                        No books found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.isbn}</TableCell>
                        <TableCell>{book.genre}</TableCell>
                        <TableCell>{book.publicationYear}</TableCell>
                        <TableCell>
                          <span className={book.availableQuantity === 0 ? "text-red-500" : ""}>
                            {book.availableQuantity} / {book.totalQuantity}
                          </span>
                        </TableCell>
                        {isLibrarian && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Book Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          </DialogHeader>
          <BookForm
            book={selectedBook}
            onSave={handleSaveBook}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <strong>{selectedBook?.title}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBook}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Books;
