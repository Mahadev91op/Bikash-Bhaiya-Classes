import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { courseId, code } = await req.json();

    if (!courseId || !code) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Course ID and Coupon Code are required.' },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim().toUpperCase();

    // 1. Check if the coupon exists SPECIFICALLY in this target course
    const courseCouponsSnap = await adminDb
      .collection('courses')
      .doc(courseId)
      .collection('coupons')
      .where('code', '==', cleanCode)
      .limit(1)
      .get();

    if (!courseCouponsSnap.empty) {
      const docSnap = courseCouponsSnap.docs[0];
      const coupon = docSnap.data();

      // Check isActive
      if (coupon.isActive === false) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: `Coupon "${cleanCode}" is currently paused/disabled for this course.`
        });
      }

      // Check expiration
      if (coupon.expiresAt) {
        const expTime = new Date(coupon.expiresAt).getTime();
        if (expTime < Date.now()) {
          return NextResponse.json({
            success: false,
            valid: false,
            error: `Coupon "${cleanCode}" expired on ${new Date(coupon.expiresAt).toLocaleDateString()}.`
          });
        }
      }

      // Check max uses limit
      if (coupon.maxUses > 0 && (coupon.usedCount || 0) >= coupon.maxUses) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: `Coupon "${cleanCode}" has reached its maximum student redemption limit (${coupon.maxUses} uses).`
        });
      }

      // Valid coupon for this course!
      return NextResponse.json({
        success: true,
        valid: true,
        coupon: {
          id: docSnap.id,
          code: coupon.code,
          courseId: courseId,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxUses: coupon.maxUses,
          usedCount: coupon.usedCount || 0
        }
      });
    }

    // 2. Coupon is NOT in this course. Check if it belongs to ANOTHER course
    try {
      const otherCouponsSnap = await adminDb
        .collectionGroup('coupons')
        .where('code', '==', cleanCode)
        .limit(1)
        .get();

      if (!otherCouponsSnap.empty) {
        const otherDoc = otherCouponsSnap.docs[0];
        const otherData = otherDoc.data();
        const parentCourseId = otherDoc.ref.parent.parent?.id || otherData.courseId;
        
        let otherCourseTitle = otherData.courseTitle;
        if (!otherCourseTitle && parentCourseId) {
          const parentDoc = await adminDb.collection('courses').doc(parentCourseId).get();
          if (parentDoc.exists) {
            otherCourseTitle = parentDoc.data()?.title;
          }
        }

        const displayCourse = otherCourseTitle || `another course (${parentCourseId})`;

        return NextResponse.json({
          success: false,
          valid: false,
          error: `Coupon "${cleanCode}" is ONLY valid for "${displayCourse}". It cannot be applied to this course!`
        });
      }
    } catch (cgErr) {
      // Fallback if collectionGroup index is not enabled in Firebase Console:
      const allCoursesSnap = await adminDb.collection('courses').select('title').limit(50).get();
      for (const cDoc of allCoursesSnap.docs) {
        if (cDoc.id === courseId) continue;
        const otherCheck = await cDoc.ref.collection('coupons').where('code', '==', cleanCode).limit(1).get();
        if (!otherCheck.empty) {
          const otherCourseTitle = cDoc.data()?.title || cDoc.id;
          return NextResponse.json({
            success: false,
            valid: false,
            error: `Coupon "${cleanCode}" is ONLY valid for "${otherCourseTitle}". It cannot be applied to this course!`
          });
        }
      }
    }

    // 3. Not found anywhere
    return NextResponse.json({
      success: false,
      valid: false,
      error: `Invalid coupon code "${cleanCode}". No such coupon exists.`
    });
  } catch (error: any) {
    console.error('Error validating coupon in student-web:', error);
    return NextResponse.json(
      { success: false, valid: false, error: 'Internal server error while validating coupon.' },
      { status: 500 }
    );
  }
}
