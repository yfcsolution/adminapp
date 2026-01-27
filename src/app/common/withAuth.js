// src/hoc/withAuth.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

/**
 * Simpler client-side auth guard:
 * - Trusts the in-memory `accessToken` set on login.
 * - If there is no token in context, redirect to `/admin/login`.
 * - Avoids relying on cookie-based APIs that can behave differently on Vercel.
 *
 * NOTE: This means a full page refresh will require logging in again,
 * but it prevents the redirect loop you're seeing after a successful login.
 */
const withAuth = (WrappedComponent) => {
  return (props) => {
    const { accessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!accessToken) {
        router.push("/admin/login");
      }
    }, [accessToken, router]);

    // Render guarded component only when we have a token in context
    if (!accessToken) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
