# Firebase Admin Dashboard (GitHub Pages)

**Last generated:** 2025-08-28T07:42:18

This is a static admin dashboard for Firebase that runs on GitHub Pages.
It uses **Firebase Auth** for admin login (email/password) and **Cloud Firestore**
to track and manage users in a `users` collection.

> **Important limitation (no server):**
> - From a purely static site (GitHub Pages), you **cannot** securely create or delete Firebase Auth accounts, or assign custom claims. Those operations require privileged access via the Admin SDK (Cloud Functions or your secure server).
> - This dashboard **manages Firestore documents** only (e.g., status = active/verified/banned). You can treat Firestore as your admin source of truth and enforce behavior in your client apps using security rules.

## Files
- `index.html` – Login screen
- `dashboard.html` – Dashboard with counts and a chart
- `manage.html` – Manage users list (verify/ban/delete **Firestore doc**, add new Firestore user record)
- `style.css` – Shared styles (accent `#748CFA`, background `#F4F9FC`)
- `common.js` – Firebase init, auth guard, shared UI helpers
- `dashboard.js` – Dashboard logic
- `manage.js` – Manage page logic
- `config.sample.js` – Copy to `config.js` and paste your Firebase web config

## Quick Start (GitHub Pages)
1. Create a Firebase project and enable **Authentication (Email/Password)** and **Cloud Firestore**.
2. Create a **web app** in Firebase console and copy the config.  
   Copy `config.sample.js` to `config.js` and paste your config.
3. In **Firestore**, create a collection `users` with documents like:
   ```json
   {
     "email": "user@example.com",
     "displayName": "User One",
     "status": "active",
     "createdAt": <server timestamp>
   }
   ```
4. Restrict access in **Firestore Rules** to your admin account UID(s):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAdmin() {
         // List of admin UIDs – replace with your Admin account UID(s)
         return request.auth != null && request.auth.uid in [
           "YOUR_ADMIN_UID_1",
           "YOUR_ADMIN_UID_2"
         ];
       }
       match /{document=**} {
         allow read, write: if isAdmin();
       }
     }
   }
   ```
5. Push this folder to a GitHub repo and enable **GitHub Pages** (Settings → Pages) with the root as the site.
6. Visit `https://<your-username>.github.io/<your-repo>/` and log in.

## Notes
- Dashboard counts and charts auto-update via Firestore listeners.
- The **Manage** page lets you: verify, ban, unban, delete Firestore user docs, and add a new Firestore user doc.
- For *real* Auth user creation/deletion or custom claims, use Cloud Functions (Admin SDK).
