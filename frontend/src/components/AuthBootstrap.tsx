import { ReactNode, useEffect, useState } from "react";
import api from "../api/axios";
import { fetchCurrentUser } from "../api/user";
import { useAuthStore } from "../store/auth.store";

interface AuthBootstrapProps {
  children: ReactNode;
}

export default function AuthBootstrap({ children }: AuthBootstrapProps): JSX.Element {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap(): Promise<void> {
      if (accessToken && user) {
        setBootstrapping(false);
        return;
      }

      try {
        const refreshResponse = await api.post("/auth/refresh", {});
        const nextToken = refreshResponse.data?.data?.accessToken as string | undefined;

        if (!nextToken) {
          throw new Error("Missing access token");
        }

        setAccessToken(nextToken);

        const currentUser = await fetchCurrentUser();
        setSession(nextToken, currentUser);
      } catch {
        clearSession();
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [accessToken, clearSession, setAccessToken, setSession, user]);

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Restoring session...
      </div>
    );
  }

  return <>{children}</>;
}
