import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("%c[MYTHOS v2] NEW FILE LOADED ✅", "color:lime;font-size:16px;font-weight:bold");

const app  = initializeApp({
  apiKey:            "AIzaSyCBisulVxzz8vnjREWIcUAVx9mr3A7Tq2s",
  authDomain:        "mythos-f8171.firebaseapp.com",
  projectId:         "mythos-f8171",
  storageBucket:     "mythos-f8171.firebasestorage.app",
  messagingSenderId: "220525358693",
  appId:             "1:220525358693:web:b88345a6ae03ae9083608c"
});

const auth = getAuth(app);
const db   = getFirestore(app);

console.log("%c[MYTHOS v2] Firebase ready 🔥", "color:orange;font-size:14px;font-weight:bold");

export async function signUp(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try { await setDoc(doc(db, "users", cred.user.uid), { name, email, createdAt: new Date().toISOString(), readingProgress: {} }); } catch (_) {}
    _saveSession(cred.user.uid, email, name);
    return { success: true };
  } catch (err) {
    return { success: false, error: _friendlyError(err.code) };
  }
}

export async function logIn(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let name = email.split("@")[0];
    try { const s = await getDoc(doc(db, "users", cred.user.uid)); if (s.exists() && s.data().name) name = s.data().name; } catch (_) {}
    _saveSession(cred.user.uid, email, name);
    return { success: true };
  } catch (err) {
    return { success: false, error: _friendlyError(err.code) };
  }
}

export async function logOut() {
  try { await signOut(auth); } catch (_) {}
  _clearSession();
  window.location.href = "./login.html";
}

export function isLoggedIn()     { return localStorage.getItem("isLoggedIn") === "true"; }
export function getCurrentUser() {
  return { uid: localStorage.getItem("userUID"), email: localStorage.getItem("userEmail"), name: localStorage.getItem("userName") || "Guest" };
}

export async function saveProgress(bookId, page) {
  const local = _getLocalProgress();
  local[bookId] = { page, savedAt: new Date().toISOString() };
  localStorage.setItem("readingProgress", JSON.stringify(local));
  const uid = localStorage.getItem("userUID");
  if (uid) try { await updateDoc(doc(db, "users", uid), { [`readingProgress.${bookId}`]: { page } }); } catch (_) {}
}

export async function getProgress(bookId) {
  const uid = localStorage.getItem("userUID");
  if (uid) try { const s = await getDoc(doc(db, "users", uid)); if (s.exists()) return s.data().readingProgress?.[bookId]?.page ?? 0; } catch (_) {}
  return _getLocalProgress()[bookId]?.page ?? 0;
}

function _saveSession(uid, email, name) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userUID",    uid);
  localStorage.setItem("userEmail",  email);
  localStorage.setItem("userName",   name);
}
function _clearSession() {
  ["isLoggedIn","userUID","userEmail","userName","loginTime"].forEach(k => localStorage.removeItem(k));
}
function _getLocalProgress() {
  try { return JSON.parse(localStorage.getItem("readingProgress") || "{}"); } catch { return {}; }
}
function _friendlyError(code) {
  return {
    "auth/invalid-credential":     "Incorrect email or password.",
    "auth/user-not-found":         "No account found. Please sign up first.",
    "auth/wrong-password":         "Incorrect password.",
    "auth/email-already-in-use":   "Email already registered. Try logging in.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/too-many-requests":      "Too many attempts. Wait a few minutes.",
    "auth/network-request-failed": "Network error. Check your connection.",
  }[code] || `Error: ${code}`;
}