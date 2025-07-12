import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Search as SearchIcon, Filter, Star, Users, Zap } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserCard from '../components/users/UserCard';
import toast from 'react-hot-toast';

const Search: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [aiMatches, setAiMatches] = useState<User[]>([]);

  const skillCategories = [
    'Technology', 'Design', 'Language', 'Music', 'Sports', 
    'Cooking', 'Art', 'Business', 'Education', 'Health'
  ];

  const locations = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'users'),
        where('isPublic', '==', true),
        orderBy('trustScore', 'desc'),
        limit(20)
      );

      if (selectedSkill) {
        q = query(q, where('skillsOffered', 'array-contains', selectedSkill));
      }

      if (selectedLocation) {
        q = query(q, where('location', '==', selectedLocation));
      }

      const snapshot = await getDocs(q);
      const userData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== user?.id) { // Exclude current user
          userData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as User);
        }
      });

      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [selectedSkill, selectedLocation, user]);

  const fetchAIMatches = useCallback(async () => {
    if (!user) return;

    try {
      // Simulate AI matchmaking - in real app, this would call an AI API
      const q = query(
        collection(db, 'users'),
        where('isPublic', '==', true),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      const matches: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== user.id) {
          matches.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as User);
        }
      });

      setAiMatches(matches.slice(0, 3));
    } catch (error) {
      console.error('Error fetching AI matches:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
    if (user) {
      fetchAIMatches();
    }
  }, [user, fetchUsers, fetchAIMatches]);

  const handleSearch = () => {
    fetchUsers();
  };

  const handleFilterChange = () => {
    fetchUsers();
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.skillsOffered.some(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    user.skillsWanted.some(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Skills</h1>
        <p className="text-gray-600">
          Discover people with the skills you need and offer your expertise in return
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, skill, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<SearchIcon className="w-5 h-5" />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Button onClick={handleSearch} className="lg:w-auto">
            Search
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Category
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => {
                    setSelectedSkill(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Skills</option>
                  {skillCategories.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Matches Section */}
      {user && aiMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Zap className="w-5 h-5 text-warning-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI Recommended Matches</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {aiMatches.map((match) => (
              <UserCard key={match.id} user={match} isAIMatch />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${filteredUsers.length} users found`}
          </h2>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {users.length} total users
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              High trust score
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more users.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search; 