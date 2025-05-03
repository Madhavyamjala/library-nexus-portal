
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BookRow, MemberRow, BorrowRecordRow,
  convertBookRowToBook, convertMemberRowToMember, convertBorrowRecordRowToBorrowRecord,
  Book, Member, BorrowRecord
} from '@/types/supabase-types';

// Hook for fetching and subscribing to books data
export function useBooksData() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial books data
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*');
        
        if (error) throw error;
        
        const formattedBooks = data.map(convertBookRowToBook);
        setBooks(formattedBooks);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('books-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'books' 
        }, 
        (payload) => {
          console.log('Realtime update for books:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newBook = convertBookRowToBook(payload.new as BookRow);
            setBooks(current => [...current, newBook]);
            toast({
              title: 'New Book Added',
              description: `"${newBook.title}" was added to the catalog.`
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedBook = convertBookRowToBook(payload.new as BookRow);
            setBooks(current => 
              current.map(book => book.id === updatedBook.id ? updatedBook : book)
            );
            toast({
              title: 'Book Updated',
              description: `"${updatedBook.title}" was updated.`
            });
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedBookId = (payload.old as BookRow).id;
            setBooks(current => current.filter(book => book.id !== deletedBookId));
            toast({
              title: 'Book Deleted',
              description: 'A book was removed from the catalog.'
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { books, loading, error };
}

// Hook for fetching and subscribing to members data
export function useMembersData() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial members data
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*');
        
        if (error) throw error;
        
        const formattedMembers = data.map(convertMemberRowToMember);
        setMembers(formattedMembers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('members-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'members' 
        }, 
        (payload) => {
          console.log('Realtime update for members:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMember = convertMemberRowToMember(payload.new as MemberRow);
            setMembers(current => [...current, newMember]);
            toast({
              title: 'New Member Added',
              description: `${newMember.name} was added as a member.`
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedMember = convertMemberRowToMember(payload.new as MemberRow);
            setMembers(current => 
              current.map(member => member.id === updatedMember.id ? updatedMember : member)
            );
            toast({
              title: 'Member Updated',
              description: `${updatedMember.name}'s information was updated.`
            });
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedMemberId = (payload.old as MemberRow).id;
            setMembers(current => current.filter(member => member.id !== deletedMemberId));
            toast({
              title: 'Member Deleted',
              description: 'A member was removed from the library.'
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { members, loading, error };
}

// Hook for fetching and subscribing to borrow records data
export function useBorrowRecordsData() {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial borrow records data
    const fetchBorrowRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('borrow_records')
          .select('*');
        
        if (error) throw error;
        
        const formattedRecords = data.map(convertBorrowRecordRowToBorrowRecord);
        setBorrowRecords(formattedRecords);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowRecords();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('borrow-records-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'borrow_records' 
        }, 
        (payload) => {
          console.log('Realtime update for borrow records:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newRecord = convertBorrowRecordRowToBorrowRecord(payload.new as BorrowRecordRow);
            setBorrowRecords(current => [...current, newRecord]);
            toast({
              title: 'Book Borrowed',
              description: 'A new borrow record was created.'
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedRecord = convertBorrowRecordRowToBorrowRecord(payload.new as BorrowRecordRow);
            setBorrowRecords(current => 
              current.map(record => record.id === updatedRecord.id ? updatedRecord : record)
            );
            toast({
              title: 'Borrow Record Updated',
              description: updatedRecord.returnDate 
                ? 'A book was returned to the library.' 
                : 'A borrow record was updated.'
            });
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedRecordId = (payload.old as BorrowRecordRow).id;
            setBorrowRecords(current => current.filter(record => record.id !== deletedRecordId));
            toast({
              title: 'Borrow Record Deleted',
              description: 'A borrow record was deleted.'
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return { borrowRecords, loading, error };
}
