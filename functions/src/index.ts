import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

// Helper to get email configuration from Firestore
async function getEmailConfig() {
  const doc = await db.collection("settings").doc("emailConfig").get();
  if (doc.exists) {
    return doc.data() as { email: string; appPassword: string; adminEmail: string };
  }
  // Fallback default
  return {
    email: "devsamp1st@gmail.com",
    appPassword: "ygbq fheh rwwj vpqo",
    adminEmail: "devsamp1st@gmail.com" // Sending to same email by default
  };
}

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const requestSignupOtp = functions.https.onCall(async (data, context) => {
  const { name, className, phone, email, password, schoolName } = data;
  if (!email || !password || !name) {
    throw new functions.https.HttpsError("invalid-argument", "Missing fields");
  }

  // Check if user already exists
  try {
    await admin.auth().getUserByEmail(email);
    throw new functions.https.HttpsError("already-exists", "User with this email already exists.");
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") throw error;
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

  await db.collection("signupOtps").doc(email.toLowerCase()).set({
    otp,
    name,
    className,
    phone,
    email: email.toLowerCase(),
    password, // Store temporarily (in production, should be hashed or handled differently, but since this is before account creation, we hold it)
    schoolName,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
  });

  const config = await getEmailConfig();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.email, pass: config.appPassword },
  });

  const mailOptions = {
    from: `"Bikash Bhaiya Classes" <${config.email}>`,
    to: email,
    subject: "Your Signup OTP - Bikash Bhaiya Classes",
    text: `Hello ${name},\n\nYour OTP for registration is: ${otp}\n\nIt is valid for 10 minutes.\n\nThanks,\nBikash Bhaiya Classes`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent to email" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", "Failed to send OTP email.");
  }
});

export const verifySignupOtp = functions.https.onCall(async (data, context) => {
  const { email, otp } = data;
  if (!email || !otp) throw new functions.https.HttpsError("invalid-argument", "Missing email or OTP");

  const normalizedEmail = email.toLowerCase();
  const docRef = db.collection("signupOtps").doc(normalizedEmail);
  const docSnap = await docRef.get();

  if (!docSnap.exists) throw new functions.https.HttpsError("not-found", "No OTP request found for this email.");

  const requestData = docSnap.data()!;
  
  if (requestData.otp !== otp) {
    throw new functions.https.HttpsError("invalid-argument", "Incorrect OTP.");
  }

  if (requestData.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError("failed-precondition", "OTP has expired.");
  }

  try {
    // 1. Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: requestData.password,
      displayName: requestData.name,
      phoneNumber: requestData.phone.startsWith("+") ? requestData.phone : `+91${requestData.phone}`,
      emailVerified: true
    });

    // 2. Create Firestore User Doc
    await db.collection("users").doc(userRecord.uid).set({
      name: requestData.name,
      email: normalizedEmail,
      phone: requestData.phone,
      className: requestData.className,
      schoolName: requestData.schoolName,
      role: "student",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Notify Admin
    const config = await getEmailConfig();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.email, pass: config.appPassword },
    });

    await transporter.sendMail({
      from: `"Bikash Bhaiya Classes System" <${config.email}>`,
      to: config.adminEmail,
      subject: "New Student Registered!",
      text: `A new student has registered on the platform:\n\nName: ${requestData.name}\nClass: ${requestData.className}\nSchool: ${requestData.schoolName}\nPhone: ${requestData.phone}\nEmail: ${normalizedEmail}`,
    });

    // 4. Cleanup
    await docRef.delete();

    // Optionally generate a custom token so client can auto-login without asking for password again
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    return { success: true, customToken };

  } catch (error: any) {
    console.error("Signup error:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to create user.");
  }
});

export const requestResetOtp = functions.https.onCall(async (data, context) => {
  const { email } = data;
  if (!email) throw new functions.https.HttpsError("invalid-argument", "Missing email");

  const normalizedEmail = email.toLowerCase();
  
  try {
    await admin.auth().getUserByEmail(normalizedEmail);
  } catch (error) {
    throw new functions.https.HttpsError("not-found", "User not found.");
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.collection("resetOtps").doc(normalizedEmail).set({
    otp,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
  });

  const config = await getEmailConfig();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.email, pass: config.appPassword },
  });

  await transporter.sendMail({
    from: `"Bikash Bhaiya Classes" <${config.email}>`,
    to: normalizedEmail,
    subject: "Password Reset OTP - Bikash Bhaiya Classes",
    text: `Your OTP for password reset is: ${otp}\n\nIt is valid for 10 minutes.`,
  });

  return { success: true, message: "Reset OTP sent to email" };
});

export const verifyResetOtpAndChangePassword = functions.https.onCall(async (data, context) => {
  const { email, otp, newPassword } = data;
  if (!email || !otp || !newPassword) throw new functions.https.HttpsError("invalid-argument", "Missing arguments");

  const normalizedEmail = email.toLowerCase();
  const docRef = db.collection("resetOtps").doc(normalizedEmail);
  const docSnap = await docRef.get();

  if (!docSnap.exists) throw new functions.https.HttpsError("not-found", "No reset request found.");
  const requestData = docSnap.data()!;
  
  if (requestData.otp !== otp) throw new functions.https.HttpsError("invalid-argument", "Incorrect OTP.");
  if (requestData.expiresAt.toDate() < new Date()) throw new functions.https.HttpsError("failed-precondition", "OTP expired.");

  try {
    const user = await admin.auth().getUserByEmail(normalizedEmail);
    await admin.auth().updateUser(user.uid, { password: newPassword });

    const config = await getEmailConfig();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.email, pass: config.appPassword },
    });

    // Notify user of password change
    await transporter.sendMail({
      from: `"Bikash Bhaiya Classes" <${config.email}>`,
      to: normalizedEmail,
      subject: "Password Changed Successfully",
      text: `Your password has been reset successfully. If this wasn't you, please contact support immediately.`,
    });

    await docRef.delete();
    return { success: true, message: "Password updated successfully." };
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
