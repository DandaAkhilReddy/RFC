# Manual Steps to Delete All Users from Firebase

Since we need admin permissions to bulk delete users, here are the manual steps:

## Option 1: Firebase Console (Easiest - Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/reddyfit-dcf41/firestore/databases/-default-/data/~2F

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on "Data" tab

3. **Delete the `users` collection**
   - Find the `users` collection in the list
   - Click on the three dots (⋮) next to `users`
   - Select "Delete collection"
   - Confirm the deletion

4. **Done!**
   - The database is now clean
   - New users will be created with correct UID structure

## Option 2: Delete Individual Documents

If you can't delete the whole collection:

1. Open Firebase Console → Firestore Database → Data
2. Click on `users` collection
3. For each document (user):
   - Click the document ID
   - Click the three dots (⋮) at the top
   - Select "Delete document"
   - Confirm deletion
4. Repeat for all user documents

## Option 3: Use Firebase Admin SDK (Advanced)

If you have a service account key:

1. Download service account JSON from Firebase Console:
   - Project Settings → Service Accounts → Generate New Private Key

2. Create `scripts/admin-delete-users.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteAllUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  console.log(`Deleting ${snapshot.size} users...`);

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('✅ All users deleted!');
}

deleteAllUsers();
```

3. Run: `node scripts/admin-delete-users.js`

## What Happens After Deletion?

After you delete all users:

1. ✅ Database is clean
2. ✅ Old documents with email-based IDs are removed
3. ✅ New logins will create users with UID-based IDs
4. ✅ Settings will save and load correctly
5. ✅ All data will persist properly

## Test After Deletion

1. Logout from the app
2. Login again with Google
3. Check console: Should see `✅ Creating new user in Firestore with UID: {uid}`
4. Go to Settings and save some data
5. Reload the page - data should persist!
6. Check Firebase Console - should see document at `users/{uid}` (not email)
