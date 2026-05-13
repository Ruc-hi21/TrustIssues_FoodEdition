import { useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-expo";
import { setTokenGetter } from "../services/api";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { isSignedIn, signOut, getToken } = useClerkAuth();
  const { user } = useUser();
  const { setClerkUser, setDbUser, dbUser } = useAuthStore();

  useEffect(() => {
    setTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setClerkUser(null);
      return;
    }
    setClerkUser(user);
    const name = user.fullName || user.firstName || "User";
    const email = user.primaryEmailAddress?.emailAddress || "";
    if (!dbUser) {
      authService
        .syncUser(name, email)
        .then((res) => {
          if (res?.user) setDbUser(res.user);
        })
        .catch(() => {});
    }
  }, [isSignedIn, user]);

  return { user, isSignedIn, signOut };
}