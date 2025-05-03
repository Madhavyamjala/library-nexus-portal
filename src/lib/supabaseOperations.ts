
import { supabase } from '@/integrations/supabase/client';
import {
  Book, Member, BorrowRecord,
  convertToBookInsert, convertToMemberInsert, convertToBorrowRecordInsert,
  SupabaseRpcFunctions
} from '@/types/supabase-types';

// Book operations
export async function addBookToSupabase(book: Partial<Book>) {
  const bookInsert = convertToBookInsert(book);
  const { data, error } = await supabase
    .from('books')
    .insert(bookInsert)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBookInSupabase(id: string, book: Partial<Book>) {
  const { data, error } = await supabase
    .from('books')
    .update({
      title: book.title,
      author: book.author,
      genre: book.genre,
      publication_year: book.publicationYear,
      total_quantity: book.totalQuantity,
      available_quantity: book.availableQuantity
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBookFromSupabase(id: string) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Member operations
export async function addMemberToSupabase(member: Partial<Member>) {
  const memberInsert = convertToMemberInsert(member);
  const { data, error } = await supabase
    .from('members')
    .insert(memberInsert)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateMemberInSupabase(id: string, member: Partial<Member>) {
  const { data, error } = await supabase
    .from('members')
    .update({
      name: member.name,
      email: member.email,
      phone: member.phone
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteMemberFromSupabase(id: string) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Borrow record operations
export async function addBorrowRecordToSupabase(record: Partial<BorrowRecord>) {
  const recordInsert = convertToBorrowRecordInsert(record);
  const { data, error } = await supabase
    .from('borrow_records')
    .insert(recordInsert)
    .select()
    .single();
  
  if (error) throw error;
  
  // Call RPC with proper typing
  await supabase.rpc<keyof SupabaseRpcFunctions>('decrease_book_availability', { 
    book_id: record.bookId as string 
  });
  
  return data;
}

export async function returnBookInSupabase(id: string, returnDate: string, fine?: number) {
  const { data: record, error: fetchError } = await supabase
    .from('borrow_records')
    .select('book_id')
    .eq('id', id)
    .single();
  
  if (fetchError) throw fetchError;
  
  const { data, error } = await supabase
    .from('borrow_records')
    .update({
      return_date: returnDate,
      fine: fine
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Call RPC with proper typing
  await supabase.rpc<keyof SupabaseRpcFunctions>('increase_book_availability', { 
    book_id: record.book_id as string 
  });
  
  return data;
}
