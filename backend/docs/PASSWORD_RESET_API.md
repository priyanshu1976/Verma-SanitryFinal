# 🔐 Password Reset API Documentation

## Overview

The Password Reset API provides a secure 3-step flow for users to reset their forgotten passwords. The system uses email verification with OTP (One-Time Password) and temporary reset tokens to ensure security.

## 🔄 Complete Flow

```
1. Request Password Reset → Send OTP to Email
2. Verify OTP → Get Reset Token
3. Reset Password → Use Reset Token
```

---

## 📋 API Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Initiates the password reset process by sending a 6-digit OTP to the user's email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200):**

```json
{
  "message": "Password reset code sent to your email"
}
```

**Response (Development Mode - 200):**

```json
{
  "code": "123456",
  "email": "user@example.com"
}
```

**Error Responses:**

- `400` - Email is required
- `404` - User not found
- `500` - Failed to send email / Internal server error

---

### 2. Verify Reset Code

**Endpoint:** `POST /api/auth/verify-forgot-password-code`

**Description:** Verifies the OTP sent to user's email and returns a temporary reset token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Success - 200):**

```json
{
  "message": "Code verified successfully",
  "resetToken": "a1b2c3d4e5f6...",
  "email": "user@example.com"
}
```

**Error Responses:**

- `400` - Email and code are required / Invalid code
- `404` - Code not found or expired
- `500` - Internal server error

---

### 3. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Changes the user's password using the reset token obtained from step 2.

**Request Body:**

```json
{
  "email": "user@example.com",
  "newPassword": "newSecurePassword123",
  "resetToken": "a1b2c3d4e5f6..."
}
```

**Response (Success - 200):**

```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses:**

- `400` - Missing required fields / Password too short
- `401` - Invalid or expired reset token
- `404` - User not found
- `500` - Internal server error

---

## 🔒 Security Features

### Token Expiration

- **OTP Code:** Expires in 10 minutes
- **Reset Token:** Expires in 15 minutes

### Single-Use Tokens

- OTP is deleted immediately after verification
- Reset token is deleted after password reset
- Prevents replay attacks

### Email Verification

- Only verified email addresses can reset passwords
- Same professional email template as registration

---

## 💻 Frontend Integration Example

### React/JavaScript Implementation

```javascript
class PasswordReset {
  async requestReset(email) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message - check email
        console.log("Reset code sent to email");
        return { success: true, data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Request reset error:", error);
      return { success: false, error: error.message };
    }
  }

  async verifyCode(email, code) {
    try {
      const response = await fetch("/api/auth/verify-forgot-password-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store reset token for next step
        localStorage.setItem("resetToken", data.resetToken);
        return { success: true, resetToken: data.resetToken };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Verify code error:", error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email, newPassword) {
    try {
      const resetToken = localStorage.getItem("resetToken");

      if (!resetToken) {
        throw new Error(
          "Reset token not found. Please verify your code again."
        );
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, resetToken }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear reset token
        localStorage.removeItem("resetToken");
        console.log("Password reset successfully");
        return { success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: error.message };
    }
  }
}

// Usage Example
const passwordReset = new PasswordReset();

// Step 1: Request reset
await passwordReset.requestReset("user@example.com");

// Step 2: User enters code from email
await passwordReset.verifyCode("user@example.com", "123456");

// Step 3: User enters new password
await passwordReset.resetPassword("user@example.com", "newPassword123");
```

---

## 🧪 Testing

### Manual Testing with Postman/Insomnia

1. **Test Password Reset Request:**

   ```
   POST http://localhost:3000/api/auth/forgot-password
   Content-Type: application/json

   {
     "email": "test@example.com"
   }
   ```

2. **Test Code Verification:**

   ```
   POST http://localhost:3000/api/auth/verify-forgot-password-code
   Content-Type: application/json

   {
     "email": "test@example.com",
     "code": "123456"
   }
   ```

3. **Test Password Reset:**

   ```
   POST http://localhost:3000/api/auth/reset-password
   Content-Type: application/json

   {
     "email": "test@example.com",
     "newPassword": "newPassword123",
     "resetToken": "obtained_from_step_2"
   }
   ```

---

## ⚠️ Important Notes

### Development vs Production

- **Development Mode:** Returns OTP code directly in API response
- **Production Mode:** Sends OTP via email only

### Environment Variables Required

```env
NODE_ENV=development  # or production
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### Redis Configuration

- OTP stored as: `otp:email@example.com`
- Reset token stored as: `reset:email@example.com`
- Automatic expiration handled by Redis

### Error Handling

- Always check response status codes
- Display user-friendly error messages
- Clear tokens on errors
- Implement retry mechanisms for network failures

---

## 🎨 Email Template

The password reset email uses the same professional template as registration:

- **Brand Colors:** #2e3f47 (dark), #c6aa55 (gold)
- **Responsive Design:** Works on all email clients
- **Clear CTA:** Prominent display of 6-digit code
- **Security Notice:** Expiration time and ignore instructions

---

## 🔧 Troubleshooting

### Common Issues

1. **"Code not found or expired"**

   - Check if 10 minutes have passed since request
   - Ensure correct email is being used

2. **"Invalid reset token"**

   - Check if 15 minutes have passed since verification
   - Ensure token is being passed correctly

3. **Email not received**

   - Check spam folder
   - Verify EMAIL_USER and EMAIL_PASS in .env
   - Ensure Gmail app password is used (not regular password)

4. **"User not found"**
   - Verify email exists in database
   - Check for typos in email address

---

## 📈 Future Enhancements

- Rate limiting for reset requests
- Account lockout after multiple failed attempts
- Password strength validation
- Email template customization
- SMS-based OTP option
- Multi-factor authentication integration

---

_Last updated: August 4, 2025_
