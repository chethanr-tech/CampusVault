# 🏛️ Campus Vault

> **A Modern Academic Resource Sharing Platform for Universities**

Campus Vault is a comprehensive web application designed to facilitate seamless sharing of academic resources among university students. Built with modern web technologies, it provides a feature-rich platform for uploading, discovering, and collaborating on educational materials.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

### 🔍 **Smart Search & Discovery**
- **Autocomplete Search** - Real-time typeahead suggestions with debounced API calls
- **Advanced Filters** - Filter by subject, semester, year, department, tags, and resource type
- **Tag-based Discovery** - Click tags to find related resources instantly

### 👤 **Enhanced User Profiles**
- **Customizable Profiles** - Add bio, upload avatar, edit personal information
- **Resource Management** - View all your uploads in a dedicated tab
- **Upload Analytics** - Track downloads and ratings for your contributions
- **Saved Resources** - Quick access to bookmarked materials

### 📤 **Rich Upload Experience**
- **Comprehensive Metadata** - Title, subject, semester, department, year, tags
- **Privacy Controls** - Set resources as private or public
- **University Restrictions** - Limit access to verified university emails
- **File Type Support** - Notes, solutions, question papers, lab reports, and more
- **Description Field** - 500-character descriptions with live character count

### 💬 **Community Engagement**
- **Reviews & Ratings** - 5-star rating system with written feedback
- **Edit Reviews** - Update your reviews anytime (marked as edited)
- **Bookmark System** - Save resources for later with one click
- **Request Board** - Request missing materials from the community

### 📄 **In-Browser Document Preview**
- **PDF Viewer** - Powered by react-pdf with full navigation
- **Page Controls** - Previous/next page, jump to specific pages
- **Zoom Functionality** - 50% to 300% zoom with +/- controls
- **Fullscreen Mode** - Distraction-free reading experience
- **Image Support** - Preview JPG, PNG, GIF, and WebP files
- **Keyboard Shortcuts** - ESC to close, arrow keys for navigation

### 🎯 **Bounty/Request Board** (NEW)
- **Create Requests** - Ask the community for specific resources
- **Smart Filters** - Filter by status (open/fulfilled/closed)
- **Response Threading** - Community members can respond with help
- **Status Tracking** - Open → Fulfilled workflow with timestamps
- **Owner Controls** - Mark fulfilled, close, or delete your requests
- **Resource Linking** - Link uploaded resources to fulfill requests

### 🎨 **Modern UI/UX**
- **Dark/Light Mode** - Seamless theme switching with system preference detection
- **Glassmorphism Design** - Modern frosted glass aesthetics
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Layout** - Mobile-first design, works on all devices
- **Toast Notifications** - Real-time feedback for all actions
- **Loading States** - Skeleton loaders and spinners for better UX
- **Empty States** - Helpful messages and CTAs when no data exists

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool and dev server
- **React Router v6** - Declarative routing

### **UI/Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Production-ready animation library

### **Document Handling**
- **react-pdf** - PDF rendering in React
- **PDF.js** - Mozilla's PDF rendering engine (via CDN)

### **State Management**
- **React Context API** - Auth and theme management
- **React Query** - Server state management
- **localStorage** - Client-side persistence

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ and npm/yarn
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/chethanr-tech/CampusVault.git
   cd CampusVault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

### **Build for Production**
```bash
npm run build
```

The optimized build will be in the `dist/` folder.

---

## 📁 Project Structure

```
neural-breach-hub-main/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components (Navbar, AppLayout)
│   │   ├── Autocomplete.tsx # Search autocomplete
│   │   ├── BountyCard.tsx   # Bounty request card
│   │   ├── DocumentPreview.tsx # PDF/image viewer
│   │   └── ResourceCard.tsx # Resource display card
│   │
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Dashboard/home
│   │   ├── Search.tsx       # Search & filters
│   │   ├── Upload.tsx       # Upload form
│   │   ├── ResourceDetail.tsx # Resource details & reviews
│   │   ├── Profile.tsx      # User profile
│   │   ├── Bounty.tsx       # Bounty list
│   │   ├── BountyDetail.tsx # Bounty details & responses
│   │   ├── CreateBounty.tsx # Create bounty request
│   │   └── Auth.tsx         # Login/register
│   │
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── ThemeContext.tsx # Theme management
│   │
│   ├── lib/                 # Utilities & APIs
│   │   └── api-client.ts    # Mock API with localStorage
│   │
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Root component with routes
│   └── main.tsx             # App entry point
│
├── public/                  # Static assets
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind customization
└── vite.config.ts           # Vite configuration
```

---

## 🎮 Usage Guide

### **For Students**

1. **Register/Login**
   - Use university email for instant verification
   - Non-university emails require admin approval

2. **Browse Resources**
   - Use the search bar with autocomplete
   - Apply filters (subject, semester, year, tags)
   - Click resource cards to view details

3. **Upload Resources**
   - Navigate to Upload page
   - Fill in metadata (title, subject, semester, etc.)
   - Add tags for better discoverability
   - Set privacy preferences
   - Upload your file

4. **Bookmark Resources**
   - Click the bookmark icon on any resource card
   - Access saved resources in your Profile → Saved Resources tab

5. **Leave Reviews**
   - Open a resource detail page
   - Rate 1-5 stars and write a comment
   - Edit or delete your reviews anytime

6. **Request Missing Resources**
   - Go to Requests page
   - Click "Create Request"
   - Describe what you need
   - Community members can respond or upload

7. **Preview Documents**
   - Click "Preview" on PDF or image resources
   - Use zoom, page navigation, and fullscreen
   - Keyboard: ESC (close), ← → (navigate pages)

---

## 🔧 API Structure

The app uses a mock API client (`src/lib/api-client.ts`) with localStorage persistence. In production, replace with actual backend endpoints.

### **Key API Methods**

#### Authentication
- `register(data)` - Create new account
- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `getCurrentUser()` - Get logged-in user

#### Resources
- `getResources(filters?)` - List resources with filters
- `getResourceById(id)` - Get single resource
- `uploadResource(data)` - Create new resource
- `updateResource(id, updates)` - Edit resource (owner only)
- `deleteResource(id)` - Remove resource (owner only)
- `downloadResource(id)` - Increment download count

#### Reviews
- `submitReview(data)` - Add review to resource
- `updateReview(id, updates)` - Edit existing review
- `deleteReview(id)` - Remove review

#### Bookmarks
- `addBookmark(resourceId)` - Save resource
- `removeBookmark(resourceId)` - Unsave resource
- `getBookmarkedResources()` - Get all saved resources
- `isBookmarked(resourceId)` - Check bookmark status

#### Bounty Board
- `createBountyRequest(data)` - Create new request
- `getBountyRequests(filters?)` - List requests
- `getBountyRequest(id)` - Get single request
- `updateBountyStatus(id, status)` - Update status
- `deleteBountyRequest(id)` - Delete request
- `addBountyResponse(data)` - Add response/comment
- `getBountyResponses(bountyId)` - Get all responses
- `fulfillBountyWithUpload(id, resource)` - Fulfill with upload

---

## 🎨 Customization

### **Theming**
Modify `src/index.css` to customize colors:
```css
@layer base {
  :root {
    --primary: 210 100% 50%;  /* Blue accent */
    --background: 0 0% 100%;  /* White background */
    /* ... more variables */
  }
  
  .dark {
    --primary: 210 100% 60%;  /* Lighter blue for dark mode */
    --background: 222 47% 11%; /* Dark background */
    /* ... more variables */
  }
}
```

### **Add New Features**
1. Create component in `src/components/` or page in `src/pages/`
2. Add route in `src/App.tsx`
3. Update API client in `src/lib/api-client.ts`
4. Add navigation link in `src/components/layout/Navbar.tsx`

---

## 📊 Data Models

### **User**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  semester: number;
  bio?: string;
  avatar?: string;
  isUniversityEmail: boolean;
  isApproved: boolean;
  pendingApproval: boolean;
  bookmarkedResources?: string[];
  createdAt: string;
}
```

### **Resource**
```typescript
interface Resource {
  id: string;
  title: string;
  subject: string;
  semester: number;
  department: string;
  type: "Notes" | "Solutions" | "Question Papers" | "Lab Reports" | "Other";
  isPrivate: boolean;
  restrictToUniversity: boolean;
  uploaderId: string;
  uploaderName: string;
  uploaderCollege: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  downloads: number;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt?: string;
  year?: number;
  description?: string;
  tags?: string[];
  sharedWith: string[];
}
```

### **BountyRequest**
```typescript
interface BountyRequest {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterCollege: string;
  subject: string;
  semester: number;
  department: string;
  year?: number;
  type?: Resource["type"];
  tags?: string[];
  status: "open" | "fulfilled" | "closed";
  createdAt: string;
  fulfilledBy?: string;
  fulfilledAt?: string;
  fulfillmentResourceId?: string;
  responseCount: number;
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Commit Convention**
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 🐛 Known Issues

- TypeScript module resolution warnings for `lucide-react`, `react-router-dom`, and `framer-motion` (editor only, runtime unaffected)
- PDF.js worker loaded from CDN (consider bundling for offline support)

---

## 🔮 Roadmap

- [ ] **Backend Integration** - Replace mock API with actual server
- [ ] **Real-time Notifications** - WebSocket-based updates
- [ ] **Admin Dashboard** - User approval, content moderation
- [ ] **Direct Messaging** - Chat between users
- [ ] **Study Groups** - Create and join study sessions
- [ ] **Calendar Integration** - Link resources to exam dates
- [ ] **Mobile App** - React Native version
- [ ] **AI-powered Recommendations** - Suggest relevant resources
- [ ] **Analytics Dashboard** - Usage statistics and insights
- [ ] **Bulk Upload** - Upload multiple files at once

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Chethan R**  
GitHub: [@chethanr-tech](https://github.com/chethanr-tech)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Vite](https://vitejs.dev/) for the blazing-fast dev experience
- Mozilla's [PDF.js](https://mozilla.github.io/pdf.js/) for PDF rendering

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/chethanr-tech/CampusVault/issues)
- Email: [your-email@example.com]

---

<div align="center">

**Made with ❤️ for students, by students**

⭐ Star this repo if you find it useful!

</div>
