// Common Firebase + UI helpers
// Requires: config.js with window.firebaseConfig

// Firebase SDKs (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, query, onSnapshot, orderBy, updateDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const app = initializeApp(window.firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function $(sel, root=document){ return root.querySelector(sel); }
export function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function guardAuth(onAuthed){
  onAuthStateChanged(auth, (user)=>{
    const path = location.pathname.split('/').pop();
    const isLogin = path === '' || path === 'index.html';
    if(user){
      if(isLogin){
        location.href = 'dashboard.html';
      }else{
        onAuthed && onAuthed(user);
      }
    }else{
      if(!isLogin){
        location.href = 'index.html';
      }
    }
  });
}

export async function doLogin(email, password, btn){
  try{
    btn && (btn.disabled = true);
    await signInWithEmailAndPassword(auth, email, password);
  }catch(err){
    alert(err.message);
  }finally{
    btn && (btn.disabled = false);
  }
}

export async function doLogout(){
  await signOut(auth);
  location.href = 'index.html';
}

export function statusBadge(status){
  const span = document.createElement('span');
  span.className = 'badge ' + (status||'active');
  span.textContent = (status||'active').toUpperCase();
  return span;
}

export async function addUserDoc({email, displayName, status='active', notes=''}){
  return addDoc(collection(db, 'users'), {
    email, displayName, status, notes,
    createdAt: serverTimestamp()
  });
}

export async function setStatus(userId, status){
  return updateDoc(doc(db, 'users', userId), { status });
}

export async function deleteUserDoc(userId){
  return deleteDoc(doc(db, 'users', userId));
}

// Expose for debugging
window.__app = { app, auth, db };
