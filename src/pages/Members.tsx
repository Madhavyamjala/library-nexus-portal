
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Member } from '@/types';
import { getMembers, addMember, updateMember, deleteMember, getBorrowRecords } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const MemberForm: React.FC<{
  member?: Member;
  onSave: (member: Member) => void;
  onClose: () => void;
}> = ({ member, onSave, onClose }) => {
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Generate a member ID if it's a new member
    const memberId = member?.id || `M${String(Date.now()).slice(-6)}`;
    
    const newMember: Member = {
      id: memberId,
      name,
      email,
      phone: phone || undefined,
    };
    
    onSave(newMember);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {member && (
        <div className="space-y-2">
          <Label>Member ID</Label>
          <Input value={member.id} disabled />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member's full name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {member ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
};

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [borrowCounts, setBorrowCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  // Load members and borrow counts
  useEffect(() => {
    loadMembers();
  }, []);
  
  const loadMembers = () => {
    const allMembers = getMembers();
    setMembers(allMembers);
    
    // Get borrow counts for each member
    const borrowRecords = getBorrowRecords();
    const counts: Record<string, number> = {};
    
    borrowRecords.forEach(record => {
      if (!record.returnDate) {
        counts[record.memberId] = (counts[record.memberId] || 0) + 1;
      }
    });
    
    setBorrowCounts(counts);
  };
  
  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    const term = searchTerm.toLowerCase();
    return (
      member.id.toLowerCase().includes(term) ||
      member.name.toLowerCase().includes(term)
    );
  });
  
  // Handle member save (add or update)
  const handleSaveMember = (member: Member) => {
    if (selectedMember) {
      updateMember(member);
      toast({
        title: "Member Updated",
        description: `${member.name}'s information has been updated.`,
      });
    } else {
      addMember(member);
      toast({
        title: "Member Added",
        description: `${member.name} has been added as a member.`,
      });
    }
    
    loadMembers();
    setIsFormOpen(false);
    setSelectedMember(undefined);
  };
  
  // Handle member delete
  const handleDeleteMember = () => {
    if (!selectedMember) return;
    
    const success = deleteMember(selectedMember.id);
    
    if (success) {
      toast({
        title: "Member Deleted",
        description: `${selectedMember.name} has been removed from the library.`,
      });
      loadMembers();
    } else {
      toast({
        title: "Cannot Delete Member",
        description: "This member has books checked out and cannot be deleted.",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedMember(undefined);
  };
  
  return (
    <Layout title="Members">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Library Members</h2>
          <Button onClick={() => { setSelectedMember(undefined); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        </div>
        
        <div className="flex items-center mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Members Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Books Borrowed</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.id}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || '-'}</TableCell>
                        <TableCell>{borrowCounts[member.id] || 0}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Member Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          <MemberForm
            member={selectedMember}
            onSave={handleSaveMember}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to remove <strong>{selectedMember?.name}</strong> from the library?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Members;
