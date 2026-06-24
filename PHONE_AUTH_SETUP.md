# Firebase Phone OTP — CV Download Gate
## Setup in ~10 minutes, zero backend

---

## How it works

```
User clicks "Exporter CV PDF"
        ↓
Phone Auth modal appears
        ↓
User types phone number (+33 6…)
        ↓
Firebase sends SMS with 6-digit code (free up to 10k/month)
        ↓
User types code → Firebase verifies
        ↓
CV modal opens normally ✓
```

---

## Step 1 — Firebase project (3 min)

1. Go to **https://console.firebase.google.com**
2. **Add project** → any name (e.g. `marc-portfolio`) → disable Google Analytics → **Create**
3. Left sidebar → **Build → Authentication** → **Get started**
4. **Sign-in method** tab → **Phone** → toggle **Enable** → **Save**
5. **Settings** tab → **Authorized domains** → **Add domain** → `marckanani.fr`

---

## Step 2 — Get your config (1 min)

1. **Project Settings** (⚙️ top left) → **Your apps** → click `</>` (Web)
2. App nickname: `portfolio` → **Register app**
3. Copy the `firebaseConfig` object shown — looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "marc-portfolio.firebaseapp.com",
  projectId: "marc-portfolio",
  storageBucket: "marc-portfolio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...:web:abc..."
};
```

---

## Step 3 — Paste config into phone-auth.js (1 min)

Open `phone-auth.js` and replace the `FIREBASE_CONFIG` block at the top:

```js
const FIREBASE_CONFIG = {
    apiKey:            "AIza...",           // ← your values
    authDomain:        "marc-portfolio.firebaseapp.com",
    projectId:         "marc-portfolio",
    storageBucket:     "marc-portfolio.appspot.com",
    messagingSenderId: "123456789",
    appId:             "1:123...:web:abc..."
};
```

---

## Step 4 — Add one line to index.html (30 sec)

In `index.html`, just before `</body>`, add:

```html
<script src="./phone-auth.js"></script>
```

That's it. The script automatically intercepts the existing `openResume()` function.

**Full snippet in context:**
```html
    ...
    <script src="./phone-auth.js"></script>   ← ADD THIS LINE
</body>
</html>
```

---

## Step 5 — Test without spending SMS credits

In Firebase Console → Authentication → **Phone** → scroll to **Phone numbers for testing**:

| Test phone number  | Verification code |
|--------------------|-------------------|
| +33 600 000 000    | 123456            |

Firebase will use these without sending a real SMS. Remove them before going live.

---

## Pricing

Firebase Phone Auth is free up to **10,000 SMS/month** (way more than a portfolio needs).
No credit card required unless you exceed that. See: https://firebase.google.com/pricing

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `auth/invalid-phone-number` | Ensure format `+33612345678` (no spaces in the `tel:` value) |
| `auth/too-many-requests` | Too many attempts from same IP — wait or use test numbers |
| reCAPTCHA not loading | Add `marckanani.fr` to Authorized Domains in Firebase |
| SMS not arriving | Check Firebase Console → Authentication → Users (entries appear even on failure) |

---

## Files delivered

| File | Purpose |
|------|---------|
| `phone-auth.js` | Drop into same folder as `index.html` |
| `PHONE_AUTH_SETUP.md` | This guide |

No changes needed to `index.html`, `resume-template.html`, or any CSS file.
