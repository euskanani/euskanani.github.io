/**
 * phone-auth.js  —  Firebase Phone OTP gate for CV download
 * Place at: /components/phone-auth.js
 * Already loaded in index.html as:
 *   <script src="../components/phone-auth.js" defer></script>
 *
 * ─── FIREBASE SETUP (5 min) ───────────────────────────────────
 * 1. https://console.firebase.google.com → New project
 * 2. Authentication → Sign-in method → Phone → Enable
 * 3. Authentication → Settings → Authorized domains → add yours
 * 4. Project Settings → Web app → copy firebaseConfig below
 * 5. For local testing: Authentication → Phone → Test phone numbers
 *    e.g.  +33 600 000 000  /  123456
 * ──────────────────────────────────────────────────────────────
 */

/* ══ EDIT ONLY THIS BLOCK ══════════════════════════════════════ */

const FIREBASE_CONFIG = {
    apiKey:            "%%FIREBASE_API_KEY%%",
    authDomain:        "%%FIREBASE_AUTH_DOMAIN%%",
    projectId:         "%%FIREBASE_PROJECT_ID%%",
    storageBucket:     "%%FIREBASE_STORAGE_BUCKET%%",
    messagingSenderId: "%%FIREBASE_MESSAGING_SENDER_ID%%",
    appId:             "%%FIREBASE_APP_ID%%",
};

/* ══════════════════════════════════════════════════════════════ */

const LABELS = {
    fr: {
        title:       'Vérification requise',
        sub:         'Entrez votre numéro pour recevoir un code SMS et accéder au CV.',
        ph_phone:    '+33 6 00 00 00 00',
        btn_send:    'Recevoir le code',
        sending:     'Envoi…',
        ph_code:     'Code à 6 chiffres',
        btn_verify:  'Vérifier & ouvrir le CV',
        verifying:   'Vérification…',
        resend:      'Renvoyer le code',
        resendIn:    s => `Renvoyer dans ${s}s`,
        back:        '← Changer le numéro',
        err_phone:   'Format invalide — ex : +33 6 12 34 56 78',
        err_code:    'Code incorrect ou expiré. Réessayez.',
        err_generic: 'Erreur réseau. Réessayez.',
        code_sent:   n => `Code envoyé au ${n}`,
    },
    en: {
        title:       'Verification required',
        sub:         'Enter your number to receive an SMS code and access the CV.',
        ph_phone:    '+44 7000 000000',
        btn_send:    'Send code',
        sending:     'Sending…',
        ph_code:     '6-digit code',
        btn_verify:  'Verify & open CV',
        verifying:   'Verifying…',
        resend:      'Resend code',
        resendIn:    s => `Resend in ${s}s`,
        back:        '← Change number',
        err_phone:   'Invalid format — e.g. +44 7000 123456',
        err_code:    'Incorrect or expired code. Please retry.',
        err_generic: 'Network error. Please retry.',
        code_sent:   n => `Code sent to ${n}`,
    },
};

/* ── CSS ────────────────────────────────────────────────────── */
const injectCSS = () => {
    if (document.getElementById('pauth-css')) return;
    const s = document.createElement('style');
    s.id = 'pauth-css';
    s.textContent = `
#pauth-overlay{
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,.52);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;
    opacity:0;pointer-events:none;
    transition:opacity .22s ease;
}
#pauth-overlay.open{opacity:1;pointer-events:all;}

#pauth-card{
    background:var(--color-bg,#faf8f5);
    border:1px solid var(--color-border,rgba(124,109,85,.22));
    border-radius:14px;
    padding:2.2rem 1.8rem 1.8rem;
    width:min(360px,92vw);
    box-shadow:0 28px 72px rgba(0,0,0,.2);
    position:relative;
    font-family:'Jost',sans-serif;
}
#pauth-x{
    position:absolute;top:.75rem;right:.9rem;
    background:none;border:none;cursor:pointer;
    font-size:1.1rem;line-height:1;padding:4px 6px;
    color:var(--color-muted,#999);border-radius:6px;
}
#pauth-x:hover{color:var(--color-text,#333);background:rgba(0,0,0,.06);}

#pauth-card h2{
    margin:0 0 .3rem;font-size:1.05rem;font-weight:700;
    color:var(--color-text,#2a2520);letter-spacing:.01em;
}
#pauth-card .pa-sub{
    margin:0 0 1.4rem;font-size:.8rem;
    color:var(--color-muted,#888);line-height:1.55;
}
.pa-input{
    display:block;width:100%;box-sizing:border-box;
    border:1.5px solid var(--color-border,rgba(124,109,85,.3));
    border-radius:8px;padding:.65rem .85rem;
    font-size:.93rem;font-family:inherit;
    background:var(--color-surface,#fff);
    color:var(--color-text,#2a2520);
    outline:none;transition:border-color .18s;
    margin-bottom:.85rem;
}
.pa-input:focus{border-color:var(--color-accent,#7c6d55);}
.pa-input::placeholder{color:var(--color-muted,#bbb);}

.pa-btn{
    display:block;width:100%;padding:.72rem;
    background:var(--color-accent,#7c6d55);
    color:#fff;border:none;border-radius:8px;
    font-size:.93rem;font-family:inherit;font-weight:700;
    cursor:pointer;letter-spacing:.03em;
    transition:opacity .18s,transform .1s;
}
.pa-btn:hover:not(:disabled){opacity:.86;}
.pa-btn:active:not(:disabled){transform:scale(.98);}
.pa-btn:disabled{opacity:.45;cursor:not-allowed;}

.pa-link{
    display:block;width:100%;text-align:center;
    margin-top:.7rem;padding:.3rem;
    font-size:.78rem;color:var(--color-muted,#999);
    cursor:pointer;text-decoration:underline;
    background:none;border:none;font-family:inherit;
}
.pa-link:hover{color:var(--color-accent,#7c6d55);}
.pa-link:disabled{opacity:.4;cursor:default;text-decoration:none;}

.pa-err{
    border-radius:7px;padding:.5rem .7rem;
    font-size:.78rem;margin-bottom:.75rem;
    display:none;
    background:#fff2f2;border:1px solid #f5b8b8;color:#c0392b;
}
.pa-err.on{display:block;}

#pauth-step-otp{display:none;}
#pauth-step-otp.on{display:block;}
#pauth-recaptcha{margin-bottom:.5rem;}
    `;
    document.head.appendChild(s);
};

/* ── HTML ───────────────────────────────────────────────────── */
const buildHTML = L => `
<div id="pauth-card" role="dialog" aria-modal="true">
  <button id="pauth-x" aria-label="Fermer">✕</button>

  <!-- Step 1: phone -->
  <div id="pauth-step-phone">
    <h2>${L.title}</h2>
    <p class="pa-sub">${L.sub}</p>
    <div class="pa-err" id="pa-err-ph"></div>
    <input id="pa-phone" class="pa-input" type="tel"
           placeholder="${L.ph_phone}" autocomplete="tel" inputmode="tel"/>
    <div id="pauth-recaptcha"></div>
    <button id="pa-send" class="pa-btn">${L.btn_send}</button>
  </div>

  <!-- Step 2: OTP -->
  <div id="pauth-step-otp">
    <h2>${L.title}</h2>
    <p class="pa-sub" id="pa-otp-sub"></p>
    <div class="pa-err" id="pa-err-otp"></div>
    <input id="pa-code" class="pa-input" type="text"
           placeholder="${L.ph_code}" maxlength="6"
           autocomplete="one-time-code" inputmode="numeric"/>
    <button id="pa-verify" class="pa-btn">${L.btn_verify}</button>
    <button id="pa-resend" class="pa-link" disabled></button>
    <button id="pa-back"   class="pa-link">${L.back}</button>
  </div>
</div>`;

/* ══ MAIN ════════════════════════════════════════════════════ */
(async () => {
    injectCSS();

    /* overlay */
    const overlay = document.createElement('div');
    overlay.id = 'pauth-overlay';
    document.body.appendChild(overlay);

    /* lazy load Firebase ESM */
    const [{ initializeApp }, { getAuth, RecaptchaVerifier, signInWithPhoneNumber }] =
        await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'),
        ]);

    const app  = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(app);
    auth.languageCode = document.documentElement.lang?.startsWith('en') ? 'en' : 'fr';

    const L = () => LABELS[document.documentElement.lang?.startsWith('en') ? 'en' : 'fr'];

    let confirmResult  = null;
    let recaptcha      = null;
    let countdown      = null;
    let originalOpen   = null;   /* set when interceptor fires */

    /* ── helpers ── */
    const $  = id => overlay.querySelector('#' + id);
    const err = (id, msg) => { const el = $(id); el.textContent = msg; el.classList.toggle('on', !!msg); };
    const btn = (id, off, label) => { const el = $(id); if (!el) return; el.disabled = off; el.textContent = label; };

    /* ── open / close ── */
    function openModal() {
        overlay.innerHTML = buildHTML(L());
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        bindEvents();
        setupRecaptcha();
        setTimeout(() => $('pa-phone')?.focus(), 60);
    }
    function closeModal() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        if (countdown) clearInterval(countdown);
    }
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    /* ── reCAPTCHA ── */
    function setupRecaptcha() {
        if (recaptcha) { try { recaptcha.clear(); } catch(_){} recaptcha = null; }
        recaptcha = new RecaptchaVerifier(auth, 'pauth-recaptcha', { size: 'invisible', callback: () => {} });
    }

    /* ── step helpers ── */
    function showOTP(phone) {
        $('pauth-step-phone').style.display = 'none';
        $('pauth-step-otp').classList.add('on');
        $('pa-otp-sub').textContent = L().code_sent(phone);
        err('pa-err-otp', '');
        $('pa-code').focus();
        startCountdown();
    }
    function showPhone() {
        $('pauth-step-otp').classList.remove('on');
        $('pauth-step-phone').style.display = '';
        err('pa-err-ph', '');
        setupRecaptcha();
        $('pa-phone').focus();
    }
    function startCountdown() {
        const { resendIn, resend } = L();
        let s = 60;
        const b = $('pa-resend');
        b.disabled = true; b.textContent = resendIn(s);
        if (countdown) clearInterval(countdown);
        countdown = setInterval(() => {
            s--;
            if (s <= 0) { clearInterval(countdown); b.disabled = false; b.textContent = resend; }
            else b.textContent = resendIn(s);
        }, 1000);
    }

    /* ── send SMS ── */
    async function handleSend() {
        const lbl = L();
        const phone = $('pa-phone').value.trim().replace(/\s/g, '');
        if (!/^\+\d{8,15}$/.test(phone)) { err('pa-err-ph', lbl.err_phone); return; }
        err('pa-err-ph', '');
        btn('pa-send', true, lbl.sending);
        try {
            confirmResult = await signInWithPhoneNumber(auth, phone, recaptcha);
            showOTP(phone);
        } catch(e) {
            console.error('[PhoneAuth] send:', e);
            err('pa-err-ph', lbl.err_generic);
            setupRecaptcha();
        } finally {
            btn('pa-send', false, lbl.btn_send);
        }
    }

    /* ── verify OTP ── */
    async function handleVerify() {
        const lbl = L();
        const code = $('pa-code').value.trim();
        if (!/^\d{6}$/.test(code)) { err('pa-err-otp', lbl.err_code); return; }
        err('pa-err-otp', '');
        btn('pa-verify', true, lbl.verifying);
        try {
            await confirmResult.confirm(code);
            closeModal();
            if (typeof originalOpen === 'function') originalOpen();   /* open the CV */
        } catch(e) {
            console.error('[PhoneAuth] verify:', e);
            err('pa-err-otp', lbl.err_code);
            btn('pa-verify', false, L().btn_verify);
        }
    }

    /* ── bind events after innerHTML render ── */
    function bindEvents() {
        $('pauth-x').onclick   = closeModal;
        $('pa-send').onclick   = handleSend;
        $('pa-verify').onclick = handleVerify;
        $('pa-back').onclick   = showPhone;
        $('pa-resend').onclick = () => { showPhone(); };
        $('pa-phone').onkeydown = e => { if (e.key === 'Enter') handleSend(); };
        $('pa-code').onkeydown  = e => { if (e.key === 'Enter') handleVerify(); };
    }

    /* ── intercept window.openResume ──────────────────────────
       The inline <script> at the bottom of index.html sets
       window.openResume AFTER this defer script runs.
       We use a MutationObserver + polling to catch it the
       moment it's defined, then swap it out.
    ────────────────────────────────────────────────────────── */
    function installInterceptor() {
        if (window._pauthDone) return;
        if (typeof window.openResume !== 'function') return;

        originalOpen = window.openResume;           /* save original */
        window.openResume = openModal;              /* replace with gate */
        window._pauthDone = true;
        console.log('[PhoneAuth] ✓ interceptor active');
    }

    /* poll every 100 ms — stops once interceptor is installed */
    const ticker = setInterval(() => {
        installInterceptor();
        if (window._pauthDone) clearInterval(ticker);
    }, 100);

    /* also try immediately and on DOMContentLoaded */
    installInterceptor();
    document.addEventListener('DOMContentLoaded', installInterceptor);
    window.addEventListener('load', installInterceptor);

})();
