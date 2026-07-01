import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [tutorData, setTutorData] = useState(null);
  const [perfilesNinos, setPerfilesNinos] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn("Auth not initialized. Running app without authentication.");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Load Tutor Data
        const tutorRef = doc(db, 'tutores', user.uid);
        const tutorSnap = await getDoc(tutorRef);
        if (tutorSnap.exists()) {
          setTutorData(tutorSnap.data());
        }

        // Load Niños Profiles
        const ninosRef = collection(db, 'perfiles_ninos');
        const q = query(ninosRef, where('tutorId', '==', user.uid));
        const ninosSnap = await getDocs(q);
        const ninos = [];
        ninosSnap.forEach((doc) => {
          ninos.push({ id: doc.id, ...doc.data() });
        });
        setPerfilesNinos(ninos);
      } else {
        setTutorData(null);
        setPerfilesNinos([]);
        setActiveProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const selectProfile = (profile) => {
    setActiveProfile(profile);
  };

  const value = {
    currentUser,
    tutorData,
    perfilesNinos,
    activeProfile,
    selectProfile,
    setPerfilesNinos // Helper for updating list after registration
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
