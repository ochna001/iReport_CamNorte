# Google & Facebook OAuth Setup

## ✅ Features Added

1. **Auto-login after OTP verification** - User goes directly to home screen
2. **Google OAuth** - "Continue with Google" button
3. **Facebook OAuth** - "Continue with Facebook" button

## 🔧 Supabase Configuration Required

### Step 1: Enable Google OAuth

1. Go to: `https://supabase.com/dashboard/project/agghqjkyzpkxvlvurjpj/auth/providers`
2. Find **Google** provider
3. Click **Enable**
4. You'll need to create a Google OAuth app:

#### Create Google OAuth App:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if needed
6. Application type: **Web application**
7. Add authorized redirect URIs:
   ```
   https://agghqjkyzpkxvlvurjpj.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**
9. Paste them into Supabase Google provider settings
10. Click **Save**

### Step 2: Enable Facebook OAuth

1. In Supabase, find **Facebook** provider
2. Click **Enable**
3. You'll need to create a Facebook app:

#### Create Facebook App:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** app type
4. Fill in app details
5. Go to **Settings** → **Basic**
6. Copy **App ID** and **App Secret**
7. Add **Facebook Login** product
8. In Facebook Login settings, add OAuth redirect URI:
   ```
   https://agghqjkyzpkxvlvurjpj.supabase.co/auth/v1/callback
   ```
9. Paste App ID and App Secret into Supabase
10. Click **Save**

### Step 3: Configure Redirect URLs

In Supabase **Authentication** → **URL Configuration**:

Add these redirect URLs:
- Development: `exp://localhost:8081`
- Production: Your app's custom scheme (e.g., `ireport://`)

## 📱 About OTP Autofill

### Why OTP Doesn't Autofill:

React Native doesn't have native OTP autofill like native iOS/Android apps because:

1. **SMS OTP Autofill** - Only works with SMS, not email OTP
2. **Email OTP** - No standard API for autofill from email
3. **Cross-platform limitation** - Different behavior on iOS vs Android

### Possible Solutions (Advanced):

#### Option 1: SMS OTP Instead of Email (Recommended)
- Use Twilio or similar SMS service
- React Native can detect SMS OTP codes
- Better UX on mobile

#### Option 2: Deep Links (Partial Solution)
- Include a deep link in the email
- Link opens app with OTP pre-filled
- Requires custom email template

#### Option 3: Clipboard Detection
- User copies code from email
- App detects clipboard content
- Auto-fills if valid 6-digit code

Let me know if you want to implement any of these!

## 🎯 Current Flow

### With Email/Password:
1. User signs up → OTP sent to email
2. User enters OTP → Verified
3. **Auto-login** → Home screen ✅

### With Google:
1. User clicks "Continue with Google"
2. Browser opens → Google login
3. User authorizes → Returns to app
4. **Auto-login** → Home screen ✅

### With Facebook:
1. User clicks "Continue with Facebook"
2. Browser opens → Facebook login
3. User authorizes → Returns to app
4. **Auto-login** → Home screen ✅

## 🔐 Security Notes

- OAuth tokens are handled by Supabase
- No passwords stored for OAuth users
- Users can link multiple providers
- Supabase manages session tokens

## 📝 Production Checklist

Before deploying to production:

- [ ] Update redirect URLs in code (change from localhost)
- [ ] Configure custom URL scheme for your app
- [ ] Update OAuth redirect URIs in Google/Facebook
- [ ] Test OAuth flow on real devices
- [ ] Add error handling for OAuth failures
- [ ] Consider adding profile creation for OAuth users

## 🎨 UI Updates

**Login Screen now has:**
- Email/Password login
- Biometric login (if enabled)
- **--- OR ---** divider
- Google OAuth button (white with border)
- Facebook OAuth button (Facebook blue)
- Continue as Guest

## 🐛 Troubleshooting

### OAuth not working?
- Check provider is enabled in Supabase
- Verify Client ID/Secret are correct
- Check redirect URIs match exactly
- Test in browser first

### Auto-login not working after OTP?
- Check `verifyOtp` returns user data
- Verify session is created
- Check navigation to `/(tabs)` works

### Want SMS OTP instead?
- Let me know and I can implement Twilio integration
- Better autofill support
- Costs money per SMS

---

**Status:** OAuth UI added ✅ | Supabase configuration needed ⚠️
