# Branch.io Setup Guide for Glow

This guide will help you set up Branch.io for referral tracking that persists through app store installs.

## 1. Branch Account Setup

1. Go to [branch.io](https://branch.io) and create an account
2. Create a new app called "Glow"
3. Get your keys from **Account Settings → App**:
   - Branch Key (Live): `key_live_xxxxx`
   - Branch Secret: `secret_live_xxxxx`

## 2. Update app.json

Replace `YOUR_BRANCH_LIVE_KEY` in `app.json` with your actual Branch Live Key:

```json
"branch_key": {
  "live": "key_live_your_actual_key_here"
}
```

And in the plugins section:
```json
["react-native-branch", {
  "apiKey": "key_live_your_actual_key_here",
  "iosAppDomain": "glow.app.link"
}]
```

## 3. Configure Branch Dashboard

### iOS Configuration
1. In Branch Dashboard, go to **Configuration → iOS**
2. Add your Apple App ID (e.g., `1234567890`)
3. Add your Bundle ID (e.g., `com.yourcompany.glow`)
4. Enable Universal Links

### Android Configuration
1. Go to **Configuration → Android**
2. Add your Package Name
3. Add SHA256 Cert Fingerprints (for production)
4. Add your Google Play URL when published

### Link Domain
1. Go to **Configuration → Link Settings**
2. Your default domain will be `glow.app.link`
3. You can add a custom domain later if needed

## 4. Creating Referral Links

### Via Branch Dashboard
1. Go to **Quick Links** in Branch Dashboard
2. Click **Create New Link**
3. Set link data:
   ```json
   {
     "code": "abc12345",  // Your referral code
     "$desktop_url": "https://glow.app",
     "$ios_url": "https://apps.apple.com/app/glow/id123456",
     "$android_url": "https://play.google.com/store/apps/details?id=com.glow"
   }
   ```
4. Optional: Set channel (e.g., "twitter", "instagram")
5. Click **Create Link**

### Programmatically (Backend)
```javascript
// Using Branch API
const createReferralLink = async (referralCode) => {
  const response = await fetch('https://api.branch.io/v1/url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      branch_key: 'key_live_xxxxx',
      data: {
        code: referralCode,
        $desktop_url: 'https://glow.app',
        $ios_url: 'https://apps.apple.com/app/glow/id123456',
        $android_url: 'https://play.google.com/store/apps/details?id=com.glow'
      }
    })
  });
  
  const result = await response.json();
  return result.url; // e.g., "https://glow.app.link/AbCdEfGh"
};
```

## 5. Testing

### Development Testing
1. Run `expo prebuild` to generate native projects
2. Run `expo run:ios` or `expo run:android`
3. Test a Branch link: `https://glow.app.link/test?code=testcode123`

### Testing Deferred Deep Links (Install Attribution)
1. Uninstall the app from your device
2. Click a Branch link on the device
3. You'll be redirected to App Store/Play Store
4. Install and open the app
5. The referral code should be captured!

### Debug Mode
Add this to see all Branch data:
```javascript
branch.subscribe(({ error, params }) => {
  console.log('Full Branch params:', JSON.stringify(params, null, 2));
});
```

## 6. Common Branch Parameters

When a user clicks a Branch link, you'll receive:
- `code`: Your custom referral code
- `+clicked_branch_link`: true if from Branch link
- `+is_first_session`: true on first app open
- `~referring_link`: The full URL clicked
- `~channel`: Source (facebook, twitter, etc.)
- `~creation_source`: How link was created

## 7. Production Checklist

- [ ] Replace all test keys with production keys
- [ ] Test on real devices (not simulators)
- [ ] Verify App Store/Play Store redirects work
- [ ] Test install attribution flow end-to-end
- [ ] Set up link analytics in Branch Dashboard
- [ ] Configure fraud prevention rules

## Troubleshooting

### Links not working after install?
- Check that Branch keys match in app.json and Branch Dashboard
- Verify app Bundle ID/Package Name matches exactly
- For iOS: Ensure Associated Domains are configured

### Not seeing referral codes?
- Check Branch Debug page: https://dashboard.branch.io/liveview/events
- Ensure you're checking `params.code` as a string
- Verify the link includes `?code=xxx` parameter

### iOS Universal Links issues?
- Download Apple App Site Association file: https://glow.app.link/apple-app-site-association
- Verify it contains your Bundle ID
- Check device logs for Universal Link errors 