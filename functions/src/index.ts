import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onStudentCreated = functions.auth.user().onCreate((user) => {
  // Scaffold for future profile creation logic
  console.log(`New user created: ${user.uid}`);
});
