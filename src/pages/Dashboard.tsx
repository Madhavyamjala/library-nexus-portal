
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { getBooks, getMembers, getBorrowRecords } from '@/lib/storage';
import { DashboardStats } from '@/types';
import { BookOpen, Users, BookCheck, Clock, Book } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { role, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalMembers: 0,
    booksBorrowed: 0,
    overdueBooks: 0,
  });

  useEffect(() => {
    // Get books, members, and borrow records
    const books = getBooks();
    const members = getMembers();
    const records = getBorrowRecords();
    const currentDate = new Date();
    
    // Calculate stats
    const booksBorrowed = records.filter(record => !record.returnDate).length;
    const overdueBooks = records.filter(record => {
      if (record.returnDate) return false;
      const dueDate = new Date(record.dueDate);
      return dueDate < currentDate;
    }).length;
    
    // Get member-specific stats
    let userSpecificStats = {};
    if (role === 'member' && user) {
      const memberRecords = records.filter(record => record.memberId === user.id && !record.returnDate);
      const memberOverdueBooks = memberRecords.filter(record => {
        const dueDate = new Date(record.dueDate);
        return dueDate < currentDate;
      }).length;
      
      userSpecificStats = {
        memberBorrowedBooks: memberRecords.length,
        memberOverdueBooks,
      };
    }
    
    setStats({
      totalBooks: books.length,
      totalMembers: members.length,
      booksBorrowed,
      overdueBooks,
      ...userSpecificStats,
    } as DashboardStats);
  }, [role, user]);

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {role === 'librarian' && (
            <>
              <StatCard 
                title="Total Books" 
                value={stats.totalBooks} 
                icon={<BookOpen className="h-4 w-4" />} 
                description="Books in the library" 
              />
              <StatCard 
                title="Total Members" 
                value={stats.totalMembers} 
                icon={<Users className="h-4 w-4" />} 
                description="Registered members"
              />
              <StatCard 
                title="Books Borrowed" 
                value={stats.booksBorrowed} 
                icon={<BookCheck className="h-4 w-4" />} 
                description="Currently checked out"
              />
              <StatCard 
                title="Overdue Books" 
                value={stats.overdueBooks} 
                icon={<Clock className="h-4 w-4" />} 
                description="Past due date" 
                className={stats.overdueBooks > 0 ? "border-red-200 bg-red-50" : ""}
              />
            </>
          )}
          
          {role === 'member' && (
            <>
              <StatCard 
                title="Books Borrowed" 
                value={(stats as any).memberBorrowedBooks || 0} 
                icon={<Book className="h-4 w-4" />} 
                description="Currently checked out" 
              />
              <StatCard 
                title="Overdue Books" 
                value={(stats as any).memberOverdueBooks || 0} 
                icon={<Clock className="h-4 w-4" />} 
                description="Past due date" 
                className={(stats as any).memberOverdueBooks > 0 ? "border-red-200 bg-red-50" : ""}
              />
            </>
          )}
        </div>
        
        {/* For a more complete dashboard, we could add recent activities, charts, etc. */}
      </div>
    </Layout>
  );
};

export default Dashboard;
