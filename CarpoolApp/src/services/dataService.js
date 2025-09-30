import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  onSnapshot 
} from 'firebase/firestore';
import { getDB } from './firebase';

// Collections
const PARENTS_COLLECTION = 'parents';
const KIDS_COLLECTION = 'kids';
const SCHOOLS_COLLECTION = 'schools';
const CARPOOLS_COLLECTION = 'carpools';

// Parent operations
export const getParentByPhone = async (phone) => {
  try {
    const db = getDB();
    const q = query(collection(db, PARENTS_COLLECTION), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting parent by phone:', error);
    throw error;
  }
};

export const createParent = async (parentData) => {
  try {
    const db = getDB();
    const docRef = await addDoc(collection(db, PARENTS_COLLECTION), {
      ...parentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating parent:', error);
    throw error;
  }
};

export const updateParent = async (parentId, updates) => {
  try {
    const db = getDB();
    const parentRef = doc(db, PARENTS_COLLECTION, parentId);
    await updateDoc(parentRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
};

// Kid operations
export const getKidByPhone = async (phone) => {
  try {
    const db = getDB();
    const q = query(collection(db, KIDS_COLLECTION), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting kid by phone:', error);
    throw error;
  }
};

export const createKid = async (kidData) => {
  try {
    const db = getDB();
    const docRef = await addDoc(collection(db, KIDS_COLLECTION), {
      ...kidData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating kid:', error);
    throw error;
  }
};

export const updateKid = async (kidId, updates) => {
  try {
    const db = getDB();
    const kidRef = doc(db, KIDS_COLLECTION, kidId);
    await updateDoc(kidRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating kid:', error);
    throw error;
  }
};

// School operations
export const searchSchools = async (searchTerm) => {
  try {
    const db = getDB();
    const schoolsSnapshot = await getDocs(collection(db, SCHOOLS_COLLECTION));
    const schools = [];
    
    schoolsSnapshot.forEach((doc) => {
      const schoolData = { id: doc.id, ...doc.data() };
      const schoolName = schoolData.name.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      // Simple fuzzy search - matches if all words in search term are found in school name
      const searchWords = search.split(' ');
      const matches = searchWords.every(word => schoolName.includes(word));
      
      if (matches) {
        schools.push(schoolData);
      }
    });
    
    return schools;
  } catch (error) {
    console.error('Error searching schools:', error);
    throw error;
  }
};

export const createSchool = async (schoolData) => {
  try {
    const db = getDB();
    const docRef = await addDoc(collection(db, SCHOOLS_COLLECTION), schoolData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating school:', error);
    throw error;
  }
};

// Carpool operations
export const getTodaysCarpool = async (date = new Date()) => {
  try {
    const db = getDB();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const q = query(collection(db, CARPOOLS_COLLECTION), where('date', '==', dateStr));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting today\'s carpool:', error);
    throw error;
  }
};

export const createCarpool = async (carpoolData) => {
  try {
    const db = getDB();
    const docRef = await addDoc(collection(db, CARPOOLS_COLLECTION), {
      ...carpoolData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating carpool:', error);
    throw error;
  }
};

export const updateCarpool = async (carpoolId, updates) => {
  try {
    const db = getDB();
    const carpoolRef = doc(db, CARPOOLS_COLLECTION, carpoolId);
    await updateDoc(carpoolRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating carpool:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToCarpool = (carpoolId, callback) => {
  const db = getDB();
  const carpoolRef = doc(db, CARPOOLS_COLLECTION, carpoolId);
  return onSnapshot(carpoolRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

export const subscribeToTodaysCarpool = (callback, date = new Date()) => {
  const db = getDB();
  const dateStr = date.toISOString().split('T')[0];
  const q = query(collection(db, CARPOOLS_COLLECTION), where('date', '==', dateStr));
  
  return onSnapshot(q, (querySnapshot) => {
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};
