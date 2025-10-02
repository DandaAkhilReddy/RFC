/**
 * Delete All Users from Firestore
 * This script deletes all documents from the 'users' collection
 * Run with: node scripts/delete-all-users.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFhGoxAAR4vLYLXNn8nDlKabiqhCPnWJk",
  authDomain: "reddyfit-dcf41.firebaseapp.com",
  projectId: "reddyfit-dcf41",
  storageBucket: "reddyfit-dcf41.firebasestorage.app",
  messagingSenderId: "123730832729",
  appId: "1:123730832729:web:16ce63a0f2d5401f60b048",
  measurementId: "G-ECC4W6B3JN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllUsers() {
  console.log('🔥 Starting to delete all users from Firestore...\n');

  try {
    // Get all documents from 'users' collection
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    console.log(`📊 Found ${snapshot.size} user documents to delete\n`);

    if (snapshot.size === 0) {
      console.log('✅ No users found. Database is already clean!\n');
      process.exit(0);
    }

    // Delete each document
    let deleted = 0;
    const deletePromises = [];

    snapshot.forEach((docSnapshot) => {
      console.log(`🗑️  Deleting user: ${docSnapshot.id}`);
      deletePromises.push(deleteDoc(doc(db, 'users', docSnapshot.id)));
      deleted++;
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    console.log(`\n✅ Successfully deleted ${deleted} user documents!`);
    console.log('🎉 Database is now clean and ready for fresh users!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    process.exit(1);
  }
}

// Run the deletion
deleteAllUsers();
