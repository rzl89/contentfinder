/**
 * Disposable Email Validator — Fixprom Anti-Abuse Shield
 * Blocks temporary, throwaway, and disposable email providers
 * to prevent automated free-trial token drain.
 */

// Comprehensive list of known disposable and temporary email domains
const DISPOSABLE_DOMAINS = new Set<string>([
  // Popular temporary email services
  'mailinator.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.co.uk',
  '10minutemail.de',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamailblock.com',
  'grr.la',
  'sharklasers.com',
  'pokemail.net',
  'spam4.me',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmail.net',
  'tempmail.plus',
  'tempmailaddress.com',
  'tempail.com',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'dispostable.com',
  'fakeinbox.com',
  'getairmail.com',
  'mohmal.com',
  'crazymailing.com',
  'burnermail.io',
  'inboxkitten.com',
  'nada.ltd',
  'getnada.com',
  'aboymail.com',
  'dropmail.me',
  'inboxbear.com',
  'fakemail.net',
  'mytemp.email',
  'mytempemail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.at',
  'trashmail.io',
  'generator.email',
  'emailondeck.com',
  'maildrop.cc',
  'luxusmail.org',
  'minuteinbox.com',
  'zillamail.com',
  'tempinbox.com',
  'emailfake.com',
  'fakemailgenerator.com',
  'disposablemail.com',
  'temporarymail.com',
  'binkmail.com',
  'bobmail.info',
  'chacuo.net',
  'devnullmail.com',
  'drdrb.net',
  'emailproxsy.com',
  'filzmail.com',
  'hartbot.de',
  'incognitomail.org',
  'meltmail.com',
  'mytrashmail.com',
  'nobulk.com',
  'noclickemail.com',
  'oneoffemail.com',
  'ourproject.org',
  'pookmail.com',
  'quickinbox.com',
  'safetymail.info',
  'shortmail.net',
  'slopsbox.com',
  'spambox.us',
  'spamcannibal.org',
  'spamcon.org',
  'spamfree24.org',
  'spamgourmet.com',
  'spamevader.com',
  'spambog.com',
  'spamhole.com',
  'spaml.com',
  'tempemail.net',
  'tempthe.net',
  'trashymail.com',
  'whyspam.me',
  'zoemail.org',
  'zetmail.com',
  'sogetthis.com',
  'superrito.com',
  'teleworm.us',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'einrot.com',
]);

// Suspicious patterns in domain name
const SUSPICIOUS_PATTERNS = [
  /temp-?mail/i,
  /disposable/i,
  /fake-?email/i,
  /throwaway/i,
  /trash-?mail/i,
  /10minute/i,
  /burner/i,
  /guerrilla/i,
  /fakemail/i,
];

export interface EmailValidationResult {
  isValid: boolean;
  isDisposable: boolean;
  domain: string;
  errorMessage?: string;
  errorMessageEn?: string;
}

/**
 * Validates an email address against syntax and disposable domain blacklist
 */
export function validateEmailAddress(email: string): EmailValidationResult {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Basic format validation
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      isValid: false,
      isDisposable: false,
      domain: '',
      errorMessage: 'Alamat email wajib diisi dengan format yang benar.',
      errorMessageEn: 'A valid email address is required.',
    };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      isDisposable: false,
      domain: '',
      errorMessage: 'Format email tidak valid.',
      errorMessageEn: 'Invalid email address format.',
    };
  }

  const domain = parts[1];

  // Check known disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      isDisposable: true,
      domain,
      errorMessage:
        'Penyedia email sementara (disposable/temp email) tidak diizinkan. Silakan gunakan penyedia email resmi (Gmail, Yahoo, Outlook, iCloud, atau email kantor) untuk mengklaim Free Trial.',
      errorMessageEn:
        'Disposable or temporary email services are not permitted. Please use a verified standard email provider (Gmail, Yahoo, Outlook, iCloud, or company email) to claim your Free Trial.',
    };
  }

  // Check heuristic suspicious patterns in domain
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(domain)) {
      return {
        isValid: false,
        isDisposable: true,
        domain,
        errorMessage:
          'Domain email ini terdeteksi sebagai layanan sementara/anonim. Gunakan email resmi Anda.',
        errorMessageEn:
          'This email domain is flagged as a temporary or burner service. Please use your verified email.',
      };
    }
  }

  return {
    isValid: true,
    isDisposable: false,
    domain,
  };
}
