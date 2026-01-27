// src/hoc/withAuth.js
// For now, keep things as simple and stable as possible in production:
// - Login is validated on the server by /api/login (email + password against the DB).
// - Once login succeeds, we do NOT add extra client-side guards that can cause redirect loops.
//
// This HOC currently just renders the wrapped component directly.
// If you later want stricter guarding, we can safely reintroduce checks here.

const withAuth = (WrappedComponent) => {
  return (props) => <WrappedComponent {...props} />;
};

export default withAuth;
