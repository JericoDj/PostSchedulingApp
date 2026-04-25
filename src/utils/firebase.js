import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'renderlabsai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log config in development to help debug missing variables
if (import.meta.env.DEV) {
  console.log('Firebase Storage Bucket:', firebaseConfig.storageBucket);
}

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

/**
 * Upload a file to Firebase Storage.
 * @param {File} file - The file to upload
 * @param {string} platform - e.g. 'facebook', 'instagram'
 * @param {string} userId - the authenticated user's ID
 * @param {function} onProgress - (percent: number) => void
 * @returns {Promise<string>} - resolved download URL
 */
export const uploadToFirebase = (file, platform, userId, onProgress) => {
  return new Promise((resolve, reject) => {
    const mediaFolder = file.type.startsWith('video/') ? 'videos' : 'images';
    const platformFolder = platform || 'general';
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `socialsync/socialmedia/${platformFolder}/${userId}/${mediaFolder}/${uniqueName}`;

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(percent));
      },
      (error) => {
        console.error('Firebase upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at:', downloadUrl);
          resolve(downloadUrl);
        } catch (err) {
          console.error('Error getting download URL:', err);
          reject(err);
        }
      }
    );
  });
};
