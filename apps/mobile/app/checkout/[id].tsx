import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../src/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';

const formatImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1632516643720-e7f5d7d6eca8?q=80&w=600&auto=format&fit=crop';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w600`;
  }
  return url;
};

export default function MobileCheckoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const courseId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const snap = await getDoc(doc(db, 'courses', courseId));
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.warn('Error fetching checkout course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleApplyCoupon = async () => {
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      // 1. Check coupon in course subcollection
      const couponsRef = collection(db, 'courses', courseId, 'coupons');
      const q = query(couponsRef, where('code', '==', cleanCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponError(`Coupon "${cleanCode}" is not valid for this course.`);
        setAppliedCoupon(null);
        return;
      }

      const cDoc = snap.docs[0];
      const cData = cDoc.data();

      if (cData.isActive === false) {
        setCouponError('This coupon is currently inactive.');
        return;
      }

      if (cData.expiresAt) {
        const now = new Date();
        const exp = typeof cData.expiresAt.toDate === 'function' ? cData.expiresAt.toDate() : new Date(cData.expiresAt);
        if (now > exp) {
          setCouponError('This coupon has expired.');
          return;
        }
      }

      const maxUses = Number(cData.maxUses || 0);
      const usedCount = Number(cData.usedCount || 0);
      if (maxUses > 0 && usedCount >= maxUses) {
        setCouponError('Coupon maximum usage limit has been reached.');
        return;
      }

      const bPrice = Number(course?.price || 0);
      let discAmt = 0;
      if (cData.discountType === 'percentage') {
        discAmt = Math.round((bPrice * Number(cData.discountValue || 0)) / 100);
      } else {
        discAmt = Math.min(bPrice, Number(cData.discountValue || 0));
      }

      setAppliedCoupon({ id: cDoc.id, ref: cDoc.ref, discountAmount: discAmt, ...cData });
      setCouponError('');
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const basePrice = Number(course?.price || 0);
  const originalDisplayPrice = Math.round(basePrice * 1.5);
  const baseDiscount = originalDisplayPrice - basePrice;
  const couponDiscount = appliedCoupon?.discountAmount ? Number(appliedCoupon.discountAmount) : 0;
  const finalPayable = Math.max(0, basePrice - couponDiscount);

  const handleProceedPay = async () => {
    if (!agreeTerms) {
      Alert.alert('Terms Agreement', 'Please agree to the Terms & Conditions to proceed.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login Required', 'Please log in to complete your enrollment.');
      router.replace('/(auth)');
      return;
    }

    setProcessing(true);
    try {
      // 1. Get student profile details
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const uData = userSnap.data() || {};

      // 2. Set enrollment doc in subcollection
      const enrollRef = doc(db, 'courses', courseId, 'enrolledStudents', user.uid);
      await setDoc(enrollRef, {
        studentId: user.uid,
        name: uData.name || 'Student',
        email: uData.email || user.email,
        phone: uData.phone || '',
        courseId: courseId,
        courseTitle: course.title || '',
        amountPaid: finalPayable,
        originalPrice: basePrice,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        enrolledAt: serverTimestamp(),
        status: 'active'
      });

      // 3. Update enrolledCount in course doc
      await updateDoc(doc(db, 'courses', courseId), {
        enrolledCount: increment(1)
      });

      // 4. Update enrolledCourses array in user doc
      await updateDoc(doc(db, 'users', user.uid), {
        enrolledCourses: arrayUnion(courseId)
      });

      // 5. If coupon used, increment coupon usedCount
      if (appliedCoupon && appliedCoupon.ref) {
        await updateDoc(appliedCoupon.ref, {
          usedCount: increment(1)
        });
      }

      // 6. Add notification
      await addDoc(collection(db, 'users', user.uid, 'notifications'), {
        title: 'Course Enrolled Successfully',
        message: `You have successfully enrolled in "${course.title}". Start watching your lectures now!`,
        type: 'enrollment',
        courseId: courseId,
        read: false,
        createdAt: serverTimestamp()
      });

      Alert.alert(
        'Enrollment Confirmed',
        `Congratulations! You have been enrolled in "${course.title}". Your account is activated.`,
        [
          {
            text: 'Go to Classroom',
            onPress: () => router.replace('/(tabs)/learning' as any),
          }
        ]
      );
    } catch (err: any) {
      console.warn('Enrollment error:', err);
      Alert.alert('Enrollment Error', err.message || 'Could not complete enrollment.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!course) return null;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Course Summary Card (Matching Design Screenshot 6) */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: formatImageUrl(course.imageUrl) }} style={styles.summaryImg} />
          <View style={styles.summaryContent}>
            <Text style={styles.academyTag}>BIKASH BHAIYA CLASSES</Text>
            <Text style={styles.summaryTitle} numberOfLines={2}>{course.title}</Text>
            <View style={styles.educatorRow}>
              <View style={styles.educatorIcon}><Text style={styles.educatorIconText}>B</Text></View>
              <Text style={styles.educatorText}>Bikash Chowdhury • Lead Educator</Text>
            </View>
          </View>
        </View>

        {/* Have a Coupon Code? (Matching Design Screenshot 6) */}
        <View style={styles.boxCard}>
          <Text style={styles.boxTitle}>Have a Coupon Code?</Text>
          <View style={styles.couponRow}>
            <TextInput
              value={couponInput}
              onChangeText={(t) => setCouponInput(t.toUpperCase())}
              placeholder="Enter coupon (e.g. SAVE50)"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              editable={!appliedCoupon && !couponLoading}
              style={styles.couponInput}
            />
            {appliedCoupon ? (
              <TouchableOpacity style={styles.removeCouponBtn} onPress={handleRemoveCoupon}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.applyBtn, (!couponInput.trim() || couponLoading) && { opacity: 0.5 }]}
                onPress={handleApplyCoupon}
                disabled={!couponInput.trim() || couponLoading}
              >
                <Text style={styles.applyBtnText}>{couponLoading ? '...' : 'Apply'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {appliedCoupon && (
            <View style={styles.couponSuccess}>
              <Text style={styles.couponSuccessText}>
                ✓ "{appliedCoupon.code}" applied! You save ₹{couponDiscount.toLocaleString()}.
              </Text>
            </View>
          )}

          {couponError ? (
            <View style={styles.couponErr}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                <Text style={styles.couponErrText}>{couponError}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Price Details (Matching Design Screenshot 6) */}
        <View style={styles.boxCard}>
          <Text style={styles.boxTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Course Original Price</Text>
            <Text style={styles.priceVal}>₹{originalDisplayPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: '#059669' }]}>Special Discount</Text>
            <Text style={[styles.priceVal, { color: '#059669' }]}>-₹{baseDiscount.toLocaleString()}</Text>
          </View>
          {appliedCoupon && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: '#2563eb' }]}>Coupon Discount ({appliedCoupon.code})</Text>
              <Text style={[styles.priceVal, { color: '#2563eb' }]}>-₹{couponDiscount.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalVal}>₹{finalPayable.toLocaleString()}</Text>
          </View>
        </View>

        {/* Select Payment Method (Matching Design Screenshot 6) */}
        <View style={styles.boxCard}>
          <Text style={styles.boxTitle}>Select Payment Method</Text>

          {[
            { id: 'upi', name: 'UPI / Google Pay / PhonePe', desc: 'Instant payment via UPI apps', iconName: 'flash-outline' as const },
            { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay & more', iconName: 'card-outline' as const },
            { id: 'netbanking', name: 'Net Banking', desc: 'All major Indian banks supported', iconName: 'business-outline' as const },
          ].map((m) => {
            const active = paymentMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodCard, active && styles.methodCardActive]}
                onPress={() => setPaymentMethod(m.id as any)}
                activeOpacity={0.8}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name={m.iconName} size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>{m.name}</Text>
                  <Text style={styles.methodDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Security & Agreement Badges */}
        <View style={styles.securityRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
            <Text style={styles.securityText}>256-bit SSL Encrypted • 100% Secure Payment</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreeTerms(!agreeTerms)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
            {agreeTerms && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the Terms & Conditions and Privacy Policy of Bikash Bhaiya Classes.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Bottom Action Bar (Matching Design Screenshot 6) */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Total Payable</Text>
          <Text style={styles.bottomBarVal}>₹{finalPayable.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, processing && { opacity: 0.6 }]}
          onPress={handleProceedPay}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Proceed to Pay 🔒</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { justifyContent: 'center', alignItems: 'center' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },

  scrollContent: { padding: 18, paddingBottom: 100 },

  // Summary Card
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  summaryImg: { width: 80, height: 74, borderRadius: 14 },
  summaryContent: { flex: 1 },
  academyTag: { fontSize: 9, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase' },
  summaryTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginVertical: 2 },
  educatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  educatorIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  educatorIconText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  educatorText: { fontSize: 10, color: '#64748b', fontWeight: '600' },

  // Box Cards
  boxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  boxTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 12 },

  // Coupon
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  applyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  removeCouponBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removeCouponText: { color: '#dc2626', fontSize: 11, fontWeight: '900' },
  couponSuccess: { backgroundColor: '#ecfdf5', padding: 8, borderRadius: 10, marginTop: 8 },
  couponSuccessText: { color: '#059669', fontSize: 11, fontWeight: '800' },
  couponErr: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 10, marginTop: 8 },
  couponErrText: { color: '#dc2626', fontSize: 11, fontWeight: '800' },

  // Price
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  priceVal: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  totalVal: { fontSize: 15, fontWeight: '900', color: '#2563eb' },

  // Methods
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
    gap: 10,
  },
  methodCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  methodIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  methodName: { fontSize: 12, fontWeight: '900', color: '#0f172a' },
  methodDesc: { fontSize: 10, color: '#64748b' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: '#2563eb' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' },

  securityRow: { alignItems: 'center', marginBottom: 12 },
  securityText: { fontSize: 11, color: '#059669', fontWeight: '800' },

  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  termsText: { flex: 1, fontSize: 11, color: '#64748b', fontWeight: '500' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  bottomBarVal: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  payBtn: { backgroundColor: '#2563eb', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  payBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
});
