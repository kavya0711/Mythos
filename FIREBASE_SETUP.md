# MYTHOS — Firebase Setup Guide
## How to connect your project in 5 minutes

---

### STEP 1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → give it a name (e.g. `mythos-app`)
3. Disable Google Analytics (optional) → click **"Create project"**

---

### STEP 2 — Enable Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

---

### STEP 3 — Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Pick a region → click **"Enable"**

---

### STEP 4 — Get Your Config Keys

1. Go to **Project Settings** (gear icon ⚙️ → Project settings)
2. Scroll to **"Your apps"** → click the **</>** (Web) icon
3. Register your app (any nickname is fine)
4. Copy the `firebaseConfig` object — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mythos-app.firebaseapp.com",
  projectId: "mythos-app",
  storageBucket: "mythos-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### STEP 5 — Paste Config into firebase-config.js

Open `firebase-config.js` and replace the placeholder block near the top:

```js
// 🔧 REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",         ← paste yours here
  authDomain: "...",
  ...
};
```

---

### STEP 6 — Add Files to Your Project

Copy these files into your project root (same folder as `index.html`):

```
your-project/
├── index.html          (unchanged)
├── login.html          ← REPLACE with new version
├── signup.html         ← REPLACE with new version
├── Library.html        ← replace only the <script> block (see patch file)
├── firebase-config.js  ← ADD THIS NEW FILE
└── assets/
    └── css/style.css   (unchanged)
```

For **Library.html**: open the file, find the existing `<script>` block
(it starts with `// Check if user is logged in`), and replace the entire
`<script>...</script>` with the contents of `Library_script_patch.html`.

---

### What happens if Firebase fails?

The app **automatically falls back to localStorage**:

| Situation              | Behavior                                      |
|------------------------|-----------------------------------------------|
| Firebase connected     | Real accounts, data syncs across devices       |
| No internet / offline  | localStorage accounts, progress saved locally  |
| Wrong config keys      | localStorage fallback, warning in console      |
| Firebase quota exceeded| localStorage fallback, warning in console      |

Users won't notice any difference in either mode.

---

### Firestore Security Rules (for production)

Once you're ready to go live, update your Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures each user can only read/write their own data.
