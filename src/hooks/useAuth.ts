import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutToAnonymous: () => Promise<void>;
};

type AuthViewState = Omit<AuthState, "signInWithGoogle" | "signOutToAnonymous">;

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthViewState>({
    user: null,
    loading: true,
    actionLoading: false,
    error: null
  });

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    setAuthState((current) => ({ ...current, actionLoading: true, error: null }));

    try {
      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        try {
          await linkWithPopup(currentUser, provider);
          return;
        } catch (error) {
          if (!shouldFallbackToGoogleSignIn(error)) {
            throw error;
          }
        }
      }

      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Google sign-in failed."
      }));
    } finally {
      setAuthState((current) => ({ ...current, actionLoading: false }));
    }
  }

  async function signOutToAnonymous() {
    setAuthState((current) => ({ ...current, actionLoading: true, error: null }));

    try {
      await signOut(auth);
    } catch (error) {
      setAuthState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Sign-out failed."
      }));
    } finally {
      setAuthState((current) => ({ ...current, actionLoading: false }));
    }
  }

  const actions = {
    signInWithGoogle,
    signOutToAnonymous
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          setAuthState((current) => ({ ...current, user, loading: false, error: null }));
          return;
        }

        try {
          const result = await signInAnonymously(auth);
          setAuthState((current) => ({ ...current, user: result.user, loading: false, error: null }));
        } catch (error) {
          setAuthState((current) => ({
            ...current,
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : "Anonymous sign-in failed."
          }));
        }
      },
      (error) => {
        setAuthState((current) => ({ ...current, user: null, loading: false, error: error.message }));
      }
    );

    return unsubscribe;
  }, []);

  return {
    ...authState,
    ...actions
  };
}

function shouldFallbackToGoogleSignIn(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  return (
    code === "auth/credential-already-in-use" ||
    code === "auth/email-already-in-use" ||
    code === "auth/account-exists-with-different-credential"
  );
}
