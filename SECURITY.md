# Security Documentation

## Security Measures Implemented

### 1. API Key Authentication
- **External APIs** (`/api/external/*`) require API key authentication
- API keys are verified using constant-time comparison to prevent timing attacks
- API key is stored as environment variable `EXTERNAL_API_KEY`
- Never expose API keys in client-side code or logs

### 2. JWT Authentication
- Admin routes use JWT tokens stored in HTTP-only cookies
- Tokens are verified using `ACCESS_TOKEN_SECRET` environment variable
- Refresh tokens are used for token rotation
- Tokens expire after 15 minutes (access) and 7 days (refresh)

### 3. CORS Protection
- CORS origins are configurable via `ALLOWED_ORIGINS` environment variable
- External APIs allow all origins (configurable)
- Admin APIs restrict origins based on configuration
- Preflight requests are properly handled

### 4. Security Headers
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Strict-Transport-Security` - Enforces HTTPS in production

### 5. Input Validation
- All API endpoints validate required parameters
- Email addresses are validated using regex
- Phone numbers are formatted to E.164 format
- Lead IDs are validated before database queries
- SQL injection prevention through Mongoose (NoSQL injection protection)

### 6. Password Security
- Passwords are hashed using bcrypt with salt rounds
- Secret codes are hashed before storage
- Passwords are never returned in API responses
- Password change requires current password verification

### 7. Database Security
- MongoDB connection uses environment variables
- Database credentials are never exposed in code
- Sensitive data (emails, phone numbers) can be masked based on user permissions
- Database indexes prevent duplicate entries

### 8. Environment Variables
All sensitive configuration is stored in environment variables:
- `MONGODB_URI` - Database connection string
- `ACCESS_TOKEN_SECRET` - JWT signing secret
- `REFRESH_TOKEN_SECRET` - JWT refresh secret
- `EXTERNAL_API_KEY` - External API authentication
- `EMAIL_SMTP_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` - Email configuration (can be stored in DB)
- `WHATSAPP_WACRM_API_KEY` - WhatsApp API key (can be stored in DB)

## Security Checklist

### ✅ Implemented
- [x] API key authentication for external APIs
- [x] JWT authentication for admin APIs
- [x] CORS protection
- [x] Security headers
- [x] Input validation
- [x] Password hashing
- [x] Environment variable usage
- [x] HTTPS enforcement (via Vercel)
- [x] Constant-time comparison for API keys
- [x] HTTP-only cookies for tokens
- [x] Sensitive data masking

### ⚠️ Recommendations for Production

1. **Rate Limiting**
   - Implement rate limiting for external APIs
   - Use services like Upstash Redis or Vercel Edge Config
   - Recommended: 100 requests/minute per API key

2. **API Key Rotation**
   - Rotate API keys every 90 days
   - Implement key versioning
   - Notify users before key expiration

3. **Monitoring & Logging**
   - Log all API requests (without sensitive data)
   - Monitor for suspicious activity
   - Set up alerts for failed authentication attempts
   - Track API usage patterns

4. **Database Security**
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Restrict database access by IP (if possible)
   - Regular database backups

5. **Email Security**
   - Use App Passwords instead of main email password
   - Enable 2FA on email accounts
   - Store email credentials encrypted in database
   - Rotate email passwords regularly

6. **Additional Measures**
   - Implement request signing for critical operations
   - Add IP whitelisting for admin APIs (optional)
   - Use Web Application Firewall (WAF)
   - Regular security audits
   - Dependency vulnerability scanning

## Known Security Considerations

### 1. CORS Configuration
- Currently allows all origins for external APIs (`*`)
- Consider restricting to specific domains in production
- Set `ALLOWED_ORIGINS` environment variable

### 2. API Key Storage
- API keys are stored in environment variables (secure)
- Consider using a secrets management service for production
- Never commit API keys to version control

### 3. Email Credentials
- Email SMTP credentials can be stored in database (encrypted recommended)
- Currently stored as plain text in database
- Consider encrypting before storage

### 4. Logging
- Ensure no sensitive data is logged
- Review error messages to avoid information leakage
- Use structured logging

### 5. Error Messages
- Error messages are user-friendly but may reveal system information
- Consider generic error messages for production
- Log detailed errors server-side only

## Vulnerability Reporting

If you discover a security vulnerability, please:
1. **DO NOT** create a public GitHub issue
2. Email security concerns to: admin@ilmulquran.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Updates

- **2024-01-27**: Initial security implementation
  - API key authentication
  - Security headers
  - Input validation
  - CORS protection

## Compliance

This application follows security best practices for:
- OWASP Top 10
- CWE Top 25
- General data protection practices

---

**Note**: Security is an ongoing process. Regular reviews and updates are recommended.
