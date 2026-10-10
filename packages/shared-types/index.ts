export interface UserProfile {
  uid: string;
  name: string;
  phoneNumber: string;
  role: 'student' | 'admin';
  class: string;
  createdAt: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  published: boolean;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  lastActive: number;
  isValid: boolean;
}
