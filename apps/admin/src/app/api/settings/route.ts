import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch emailConfig
    const emailDoc = await adminDb.collection('settings').doc('emailConfig').get();
    const emailData = emailDoc.exists ? emailDoc.data() : null;

    // 2. Fetch adminConfig
    const adminDoc = await adminDb.collection('settings').doc('adminConfig').get();
    const adminData = adminDoc.exists ? adminDoc.data() : null;

    // 3. Fetch paymentConfig
    const paymentDoc = await adminDb.collection('settings').doc('paymentConfig').get();
    const paymentData = paymentDoc.exists ? paymentDoc.data() : null;

    // 4. Fetch systemConfig (maintenance mode)
    const systemDoc = await adminDb.collection('settings').doc('systemConfig').get();
    const systemData = systemDoc.exists ? systemDoc.data() : null;

    // 5. Fetch Database Stats (counts)
    let studentCount = 0;
    let courseCount = 0;
    let settingsCount = 0;

    try {
      const [uSnap, cSnap, sSnap] = await Promise.all([
        adminDb.collection('users').count().get(),
        adminDb.collection('courses').count().get(),
        adminDb.collection('settings').count().get()
      ]);
      studentCount = uSnap.data().count;
      courseCount = cSnap.data().count;
      settingsCount = sSnap.data().count;
    } catch (countErr) {
      console.warn('Count aggregation error, falling back:', countErr);
    }

    // 6. Fetch Storage Stats
    let totalStorageBytes = 0;
    let totalStorageFiles = 0;
    let storageBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'bikash-bhaiya-classes.firebasestorage.app';
    let storageStatus = 'connected';

    try {
      const bucket = adminStorage.bucket(storageBucketName);
      const [exists] = await bucket.exists();
      if (exists) {
        const [files] = await bucket.getFiles({ maxResults: 1000 });
        totalStorageFiles = files.length;
        files.forEach((f) => {
          totalStorageBytes += parseInt((f.metadata.size as string) || '0', 10);
        });
      }
    } catch (storageErr) {
      // Storage might not have active buckets yet
      storageStatus = 'idle';
    }

    // Format storage size
    let formattedSize = '0.00 KB';
    if (totalStorageBytes > 1024 * 1024 * 1024) {
      formattedSize = `${(totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (totalStorageBytes > 1024 * 1024) {
      formattedSize = `${(totalStorageBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (totalStorageBytes > 0) {
      formattedSize = `${(totalStorageBytes / 1024).toFixed(2)} KB`;
    }

    return NextResponse.json({
      success: true,
      config: {
        email: {
          email: emailData?.email || '',
          adminEmail: emailData?.adminEmail || '',
          hasAppPassword: Boolean(emailData?.appPassword),
          appPasswordMasked: emailData?.appPassword ? '••••••••••••••••' : '',
          rawAppPassword: emailData?.appPassword || '',
          updatedAt: emailData?.updatedAt || null
        },
        admin: {
          hasPassword: Boolean(adminData?.password),
          updatedAt: adminData?.updatedAt || null
        },
        payment: {
          keyId: paymentData?.keyId || '',
          hasSecret: Boolean(paymentData?.keySecret),
          keySecretMasked: paymentData?.keySecret ? '••••••••••••••••' : '',
          rawSecret: paymentData?.keySecret || '',
          isEnabled: paymentData?.isEnabled ?? false,
          updatedAt: paymentData?.updatedAt || null
        },
        system: {
          maintenanceMode: systemData?.maintenanceMode ?? false,
          maintenanceMessage: systemData?.maintenanceMessage || 'The platform is currently undergoing scheduled maintenance. Please check back shortly.',
          updatedAt: systemData?.updatedAt || null
        }
      },
      infrastructure: {
        database: {
          provider: 'Google Cloud Firestore',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'bikash-bhaiya-classes',
          status: 'online',
          collections: {
            users: studentCount,
            courses: courseCount,
            settings: settingsCount
          }
        },
        storage: {
          provider: 'Firebase Cloud Storage',
          bucketName: storageBucketName,
          totalFiles: totalStorageFiles,
          totalBytes: totalStorageBytes,
          formattedSize,
          status: storageStatus
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const nowIso = new Date().toISOString();

    // 1. Update Email Config
    if (action === 'update-email') {
      const { email, appPassword, adminEmail } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Sender email is required' }, { status: 400 });
      }

      const existingDoc = await adminDb.collection('settings').doc('emailConfig').get();
      const existingData = existingDoc.exists ? existingDoc.data() : {};

      const cleanPassword = (appPassword && appPassword.trim().length > 0 && !appPassword.includes('••••'))
        ? appPassword.trim()
        : existingData?.appPassword || '';

      if (!cleanPassword) {
        return NextResponse.json({ success: false, error: 'App Password is required' }, { status: 400 });
      }

      await adminDb.collection('settings').doc('emailConfig').set({
        email: email.trim().toLowerCase(),
        appPassword: cleanPassword,
        adminEmail: (adminEmail || email).trim().toLowerCase(),
        updatedAt: nowIso
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Email configuration updated successfully. All email services updated in real-time!'
      });
    }

    // 2. Update Admin Password
    if (action === 'update-password') {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Both current and new password are required' }, { status: 400 });
      }

      const adminDoc = await adminDb.collection('settings').doc('adminConfig').get();
      if (!adminDoc.exists) {
        return NextResponse.json({ success: false, error: 'Admin configuration not found' }, { status: 500 });
      }

      const dbPassword = adminDoc.data()?.password;
      if (currentPassword !== dbPassword) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      await adminDb.collection('settings').doc('adminConfig').set({
        password: newPassword,
        updatedAt: nowIso
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Admin password changed successfully!'
      });
    }

    // 3. Update Payment (Razorpay) Config
    if (action === 'update-payment') {
      const { keyId, keySecret, isEnabled } = body;

      const existingDoc = await adminDb.collection('settings').doc('paymentConfig').get();
      const existingData = existingDoc.exists ? existingDoc.data() : {};

      const cleanSecret = (keySecret && keySecret.trim().length > 0 && !keySecret.includes('••••'))
        ? keySecret.trim()
        : existingData?.keySecret || '';

      await adminDb.collection('settings').doc('paymentConfig').set({
        keyId: (keyId || '').trim(),
        keySecret: cleanSecret,
        isEnabled: Boolean(isEnabled),
        updatedAt: nowIso
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Payment configuration updated successfully.'
      });
    }

    // 4. Toggle Maintenance Mode
    if (action === 'toggle-maintenance') {
      const { maintenanceMode, maintenanceMessage } = body;

      await adminDb.collection('settings').doc('systemConfig').set({
        maintenanceMode: Boolean(maintenanceMode),
        maintenanceMessage: maintenanceMessage || 'The platform is currently undergoing scheduled maintenance. Please check back shortly.',
        updatedAt: nowIso
      }, { merge: true });

      return NextResponse.json({
        success: true,
        maintenanceMode: Boolean(maintenanceMode),
        message: maintenanceMode 
          ? 'Maintenance mode turned ON. Student app & website are now in maintenance.'
          : 'Maintenance mode turned OFF. Student app & website are now LIVE.'
      });
    }

    // 5. Test Email Configuration
    if (action === 'test-email') {
      const { email, appPassword, targetEmail } = body;

      const existingDoc = await adminDb.collection('settings').doc('emailConfig').get();
      const existingData = existingDoc.exists ? existingDoc.data() : {};

      const cleanEmail = (email || existingData?.email || '').trim().toLowerCase();
      const cleanPassword = (appPassword && appPassword.trim().length > 0 && !appPassword.includes('••••'))
        ? appPassword.trim()
        : existingData?.appPassword || '';
      const recipient = (targetEmail || existingData?.adminEmail || cleanEmail).trim().toLowerCase();

      if (!cleanEmail || !cleanPassword) {
        return NextResponse.json({
          success: false,
          error: 'Please provide both Sender Email and App Password to test.'
        }, { status: 400 });
      }

      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: cleanEmail,
          pass: cleanPassword
        }
      });

      // Verify SMTP credentials
      await transporter.verify();

      // Send test message
      await transporter.sendMail({
        from: `Bikash Bhaiya Classes <${cleanEmail}>`,
        to: recipient,
        subject: '✅ Test Verification Email - Bikash Bhaiya Classes',
        text: `Hello! This is a test verification email from your Bikash Bhaiya Classes Admin Panel.\n\nYour Nodemailer configuration is 100% working and ready to dispatch student OTPs and notifications!\n\nTimestamp: ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background-color: #2563eb; color: #ffffff; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; font-weight: bold; font-size: 24px;">B</div>
              <h2 style="color: #0f172a; margin: 12px 0 4px;">Bikash Bhaiya Classes</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Admin Email Diagnostic Tool</p>
            </div>
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; color: #065f46;">
              <h3 style="margin: 0 0 6px; font-size: 16px;">🎉 SMTP Connected Successfully!</h3>
              <p style="margin: 0; font-size: 14px;">Your Gmail App Password is valid. The platform can now instantly dispatch student signup OTPs, reset codes, and course enrollment notices.</p>
            </div>
            <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 140px;">Sender Account:</td><td>${cleanEmail}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Delivered To:</td><td>${recipient}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Verified At:</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
        `
      });

      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${recipient}!`
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
