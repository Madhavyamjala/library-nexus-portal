
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  LayoutDashboard,
  BookCheck,
  Menu,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { role, logout } = useAuth();

  const isLibrarian = role === 'librarian';

  const navItems = [
    { 
      path: "/dashboard", 
      name: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      roles: ['librarian', 'member']
    },
    { 
      path: "/books", 
      name: "Books", 
      icon: <BookOpen className="h-5 w-5" />, 
      roles: ['librarian', 'member']
    },
    { 
      path: "/members", 
      name: "Members", 
      icon: <Users className="h-5 w-5" />, 
      roles: ['librarian']
    },
    { 
      path: "/borrowing", 
      name: "Borrowing", 
      icon: <BookCheck className="h-5 w-5" />, 
      roles: ['librarian']
    },
    { 
      path: "/my-books", 
      name: "My Books", 
      icon: <BookCheck className="h-5 w-5" />, 
      roles: ['member']
    },
  ];

  return (
    <div className={cn("min-h-screen bg-slate-50 border-r flex flex-col", 
      collapsed ? "w-16" : "w-64",
      "transition-all duration-300",
      className
    )}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary">LibraryNexus</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          // Only show items relevant to the user's role
          if (!item.roles.includes(role || '')) return null;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-md hover:bg-primary/10",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-slate-700"
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center w-full justify-start",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
