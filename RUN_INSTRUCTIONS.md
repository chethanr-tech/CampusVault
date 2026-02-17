# How to Run Campus Vault

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or bun package manager

### Option 1: Using PowerShell with Execution Policy Bypass
```powershell
# Navigate to project directory
cd "c:\Users\cheth\OneDrive\Desktop\Neural Breach\neural-breach-hub-main"

# Install dependencies (bypass execution policy for this session)
powershell -ExecutionPolicy Bypass -Command "npm install"

# Start development server
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

### Option 2: Using Command Prompt
```cmd
cd "c:\Users\cheth\OneDrive\Desktop\Neural Breach\neural-breach-hub-main"
npm install
npm run dev
```

### Option 3: Enable PowerShell Scripts Permanently (Run as Administrator)
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then run normally:
```powershell
npm install
npm run dev
```

## Testing the Application

Once the server is running (`http://localhost:5173`):

1. **Test Authentication**:
   - Visit the site → Should redirect to `/auth`
   - Register with `test@iit.edu` → Instant access ✅
   - Logout and register with `test@gmail.com` → See approval pending screen ⏳

2. **Test Upload with University Restriction**:
   - Login → Go to Upload
   - Toggle "Restrict to [Your College] Only"
   - Upload a resource

3. **Test Sharing**:
   - Upload private resource
   - View resource → Use "Share Access" section
   - Enter another user's email
   - Login as that user → Resource should be accessible

4. **Test Access Control**:
   - Login as User A (College A)
   - Try to access User B's private resource (College B)
   - Should see "Access Denied" message

## Quick Demo Data

Use these test accounts (already in mock data):
- `aarav@iit.edu` - IIT Delhi student
- `priya@bits.edu` - BITS Pilani student  
- `rohan@iit.edu` - IIT Delhi student

Or create new accounts to test the approval flow!
