# Security Policy

The Voice Force team takes the security of our autonomous telephony infrastructure and user data seriously. Because Voice Force processes voice streams, transcripts, telephony credentials, and enterprise API keys, we maintain rigorous standards of privacy and responsible disclosure.

---

## Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported | Notes |
| :--- | :---: | :--- |
| **v1.x (Current / Main)** | ✅ Yes | Actively supported with immediate security patches. |
| **< v1.0** | ❌ No | Deprecated development versions. Please upgrade to latest main. |

---

## Reporting a Vulnerability

If you discover a potential security vulnerability within Voice Force, **please do not disclose it publicly or open a public GitHub issue.**

### Reporting Procedure:
1. **Email Us**: Send an email to `security@vanityworkspace.com`.
2. **Subject Line**: Use the format: `[SECURITY] Potential vulnerability in <component/package>`.
3. **Include Details**:
   - Description of the vulnerability.
   - Affected file(s), line numbers, or endpoints.
   - Proof-of-concept (PoC) code or step-by-step instructions to reproduce.
   - Any proposed mitigations or patches (if available).
   - Your name/handle for public acknowledgement (optional).

### Our Response Timeline:
- **Initial Acknowledgement**: Within 24-48 hours.
- **Triage & Assessment**: Within 5 business days.
- **Remediation & Patch**: We aim to release a patch within 14 days of triage.
- **Public Disclosure**: Coordinated after the fix has been merged and deployed.

---

## Security Best Practices for Self-Hosters

When self-hosting Voice Force in production:
1. **Never commit `.env` files**: Ensure `.env` is listed in `.gitignore`.
2. **Use Strong Secrets**: Ensure `JWT_SECRET` is at least 32 cryptographically random characters.
3. **Isolate Database & Redis**: Do not expose Postgres (5434) or Redis (6380) directly to the public internet without firewall restrictions or VPC isolation.
4. **Enable PII & PCI Redaction**: Keep `GuardrailEnforcementEngine` active to prevent sensitive credit card and SSN numbers from being written into plaintext call transcripts.
5. **Enforce HTTPS/WSS**: Always terminate TLS using a reverse proxy (e.g., Cloudflare, Caddy, NGINX).

---

## Recognition & Bounties

We appreciate security researchers who invest their time to improve our open-source codebase. While we do not operate a formal cash bug bounty program at this time, verified contributors will be recognized on our Security Hall of Fame.
