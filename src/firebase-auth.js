import { initializeApp } from "@firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "@firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const missingConfig = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => key);

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(`apex:${name}`, { detail }));
}

function errorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "That email already has an account. Sign in instead.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication settings.",
    "auth/operation-not-allowed": "Enable this sign-in method in Firebase Console → Authentication → Sign-in method.",
    "auth/network-request-failed": "Network error. Check your connection and try again."
  };
  return messages[error.code] || "Sign-in failed. Check your details and Firebase Authentication settings, then try again.";
}

if (missingConfig.length) {
  emit("auth-config", {
    configured: false,
    message: "Firebase sign-in is not configured. Add the required VITE_FIREBASE values to .env.local and restart the app."
  });
  emit("auth-ready", {});
} else {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    emit("auth-config", { configured: true });
    onAuthStateChanged(
      auth,
      user => {
        emit("auth-state", { user });
        emit("auth-ready", {});
      },
      error => {
        console.error("Could not read Firebase authentication state.", error);
        emit("auth-error", { message: "Could not check your sign-in status. Reload the page and try again." });
        emit("auth-ready", {});
      }
    );

    window.addEventListener("apex:auth-request", async event => {
      const { action, email, password } = event.detail || {};
      if (!["google", "signin", "signup", "reset", "signout"].includes(action)) return;
      emit("auth-busy", { busy: true });
      try {
        if (action === "google") {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          await signInWithPopup(auth, provider);
        } else if (action === "signin") {
          await signInWithEmailAndPassword(auth, email, password);
        } else if (action === "signup") {
          await createUserWithEmailAndPassword(auth, email, password);
        } else if (action === "reset") {
          await sendPasswordResetEmail(auth, email);
          emit("auth-notice", { message: "Password reset email sent. Check your inbox." });
        } else {
          await signOut(auth);
        }
      } catch (error) {
        console.error("Firebase authentication request failed.", error);
        emit("auth-error", { message: errorMessage(error) });
      } finally {
        emit("auth-busy", { busy: false });
      }
    });
  } catch (error) {
    console.error("Could not initialize Firebase Authentication.", error);
    emit("auth-config", {
      configured: false,
      message: "Firebase could not start. Check the Firebase configuration and reload the app."
    });
    emit("auth-ready", {});
  }
}
