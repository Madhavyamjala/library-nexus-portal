
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initializeStorage } from '@/lib/storage';
import { BookOpen } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Initialize storage in case it's first login
    initializeStorage();
    
    const success = login(username, password);
    
    setLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-2 flex flex-col items-center">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Library Portal</CardTitle>
            <CardDescription>
              Sign in to manage your library
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Use <span className="font-semibold">librarian/lib123</span> for Librarian access<br />
            or <span className="font-semibold">member/mem123</span> for Member access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
