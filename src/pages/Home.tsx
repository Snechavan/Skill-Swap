import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowRight, 
  Star, 
  Zap, 
  Search,
  MessageSquare
} from 'lucide-react';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Find Skills',
      description: 'Search and discover people with the skills you need'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Easy Swapping',
      description: 'Request skill swaps with a simple click'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Rate & Review',
      description: 'Build trust through feedback and ratings'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Learning',
      description: 'Learn new skills from experts in your community'
    }
  ];

  const stats = [
    { number: '1,000+', label: 'Active Users' },
    { number: '500+', label: 'Skills Swapped' },
    { number: '4.8', label: 'Average Rating' },
    { number: '50+', label: 'Cities' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Swap Skills,{' '}
              <span className="text-gradient">Grow Together</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with people who have the skills you need and offer your expertise in return. 
              Build meaningful relationships while learning and teaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/search">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Find Skills
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="text-lg px-8 py-4">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Skill Swap?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect, learn, and grow together through skill sharing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and add the skills you can offer and the skills you want to learn.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Find Matches</h3>
              <p className="text-gray-600">
                Search for people with the skills you need and who want your skills.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Swapping</h3>
              <p className="text-gray-600">
                Send swap requests, meet up, and exchange your knowledge and skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Swapping Skills?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already learning and teaching through skill swaps.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" className="!bg-white !text-primary-600 hover:!bg-gray-100 !border-2 !border-white text-lg px-8 py-4">
                Join Skill Swap
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Testing Section - Only show when not authenticated */}
      {!isAuthenticated && (
        <div className="bg-gray-50 border-t border-gray-200 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              🧪 Testing Guide
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Quick Test Options</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                    variant="outline"
                  >
                    Try Demo Account
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="w-full"
                    variant="outline"
                  >
                    Create Real Account
                  </Button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Test Features</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ User Registration & Login</li>
                  <li>✅ Profile Management</li>
                  <li>✅ Skill Search & Browse</li>
                  <li>✅ Swap Request System</li>
                  <li>✅ Feedback & Ratings</li>
                  <li>✅ Admin Dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold">Skill Swap</span>
              </div>
              <p className="text-gray-400">
                Connecting people through skill sharing and mutual learning.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/search" className="hover:text-white">Search Skills</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/safety" className="hover:text-white">Safety Tips</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button type="button" className="hover:text-white" onClick={() => toast.error('Social links not implemented yet')}>Twitter</button></li>
                <li><button type="button" className="hover:text-white" onClick={() => toast.error('Social links not implemented yet')}>LinkedIn</button></li>
                <li><button type="button" className="hover:text-white" onClick={() => toast.error('Social links not implemented yet')}>Instagram</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Skill Swap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 