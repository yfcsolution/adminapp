// src/hoc/withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { accessToken, getAccessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Attempt to get the access token once on mount
      const checkAuth = async () => {
        const token = await getAccessToken();
        if (!token) {
          router.push('/admin/login'); // Redirect to login if not authenticated
        }
      };

      checkAuth();
    }, [getAccessToken, router]);

    // Show the component if authenticated, otherwise it will redirect to login
    return accessToken ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
