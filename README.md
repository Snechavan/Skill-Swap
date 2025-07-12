# Skill Swap Platform

A comprehensive web application that enables users to list their skills and request skill swaps with others in return.

## 🏆 Team:Team 4304

### Team Members:
- **Atharva Bhosale** - Team Leader
- **Sneha Chavan** - Developer
- **Darshan Patil** - Developer  
- **Prachi Bhagat** - Developer

---

## 📋 Problem Statement

Develop a Skill Swap Platform — a mini application that enables users to list their skills and request others in return.

### Core Features:

#### User Profile Management
- **Basic Info**: Name, location (optional), profile photo (optional)
- **Skills Management**: List of skills offered and skills wanted
- **Availability**: Set availability (e.g., weekends, evenings)
- **Privacy Control**: Users can make their profile public or private

#### Search & Discovery
- Browse or search others by skill (e.g., "Photoshop" or "Excel")
- Advanced filtering and matching system

#### Swap Request System
- Request skill swaps from other users
- Accept or reject swap offers
- View current and pending swap requests
- Delete swap requests if not accepted
- Ratings and feedback after completed swaps

#### Admin Panel
- **Content Moderation**: Reject inappropriate or spammy skill descriptions
- **User Management**: Ban users who violate platform policies
- **Swap Monitoring**: Monitor pending, accepted, or cancelled swaps
- **Platform Communication**: Send platform-wide messages (feature updates, downtime alerts)
- **Analytics**: Download reports of user activity, feedback logs, and swap stats

---

## 🚀 Features Implemented

### ✅ Core Features
- [x] User authentication and registration
- [x] User profile management with skills listing
- [x] Public/private profile settings
- [x] Skill search and filtering
- [x] Swap request system (request, accept, reject, delete)
- [x] Rating and feedback system
- [x] Real-time notifications
- [x] Admin dashboard with moderation tools
- [x] Platform messaging system
- [x] Data export and reporting

### ✅ Advanced Features
- [x] AI-powered skill matching
- [x] Gamification system (badges, trust scores)
- [x] Real-time chat notifications
- [x] Responsive design for mobile and desktop
- [x] Multi-language support ready
- [x] Dark/Light theme support

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zustand** - State management

### Backend & Database
- **Firebase** - Backend-as-a-Service
- **Firestore** - NoSQL cloud database
- **Firebase Authentication** - User authentication
- **Firebase Storage** - File storage

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control

---

## 📁 Project Structure

```
skill-swap/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── modals/          # Modal components
│   │   └── users/           # User-related components
│   ├── firebase/
│   │   └── config.ts        # Firebase configuration
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   ├── auth/            # Authentication pages
│   │   └── ...              # Main application pages
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   └── index.tsx            # Application entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Snechavan/skill-demo.git
   cd skill-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Update `src/firebase/config.ts` with your Firebase credentials

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Update the Firebase config in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

---

## 📱 Features Walkthrough

### For Users
1. **Registration/Login**: Create account or sign in
2. **Profile Setup**: Add skills, availability, and preferences
3. **Search**: Find users with desired skills
4. **Request Swaps**: Send swap requests to other users
5. **Manage Requests**: Accept, reject, or delete swap requests
6. **Rate & Review**: Provide feedback after completed swaps

### For Admins
1. **Dashboard**: Monitor platform activity
2. **User Management**: Ban users, moderate content
3. **Reports**: Export user activity and swap statistics
4. **Platform Messages**: Send announcements to all users

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testNamePattern="Authentication"
```

See `TESTING_GUIDE.md` for detailed testing instructions.

---

## 📊 Database Schema

### Collections

#### Users
```typescript
{
  id: string;
  name: string;
  email: string;
  location?: string;
  photoURL?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  trustScore: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### SwapRequests
```typescript
{
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Feedback
```typescript
{
  id: string;
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
```

---

## 🔒 Security Features

- Firebase Authentication with email/password
- Firestore security rules
- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting on API calls

---

## 🚀 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

### Other Platforms
- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop build folder
- **AWS S3**: Upload build files

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team Contributions

### Atharva Bhosale (Team Leader)
- Project architecture and planning
- Firebase integration
- Admin panel development
- Code review and quality assurance

### Sneha Chavan
- Frontend development
- User interface design
- Authentication system
- State management

### Darshan Patil
- Backend logic
- Database schema design
- API development
- Testing and debugging

### Prachi Bhagat
- UI/UX design
- Component development
- Responsive design
- Documentation

---

## 📞 Support

For support, email the team or create an issue in the repository.

---

## 🎯 Future Enhancements

- [ ] Mobile app development
- [ ] Video call integration
- [ ] Advanced AI matching
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Skill verification system

---

**Built with ❤️ by Team Bit Benders**
