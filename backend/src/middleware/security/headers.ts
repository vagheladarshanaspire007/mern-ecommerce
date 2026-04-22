/**
 * ============================================================
 * Security Headers — src/middleware/security/headers.ts
 * ============================================================
 * WHY custom headers beyond helmet:
 *   helmet covers most security headers but we add a few extras
 *   and document WHY each one exists for interns.
 *
 * Security Headers Quick Reference:
 *   X-Frame-Options          → Prevents clickjacking (iframes)
 *   X-Content-Type-Options   → Prevents MIME type sniffing
 *   X-XSS-Protection         → Legacy XSS filter (modern browsers use CSP instead)
 *   Referrer-Policy          → Controls what URL info is sent in Referrer header
 *   Permissions-Policy       → Restricts browser APIs (camera, mic, geolocation)
 *   X-Request-ID             → Correlation ID for distributed tracing
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent browsers from sending full referrer URL to third parties
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features — deny access to camera, mic, geolocation
  // WHY: Even if your app doesn't use these, an XSS attack could
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Prevent this page from being embedded in iframes on other domains
  // WHY: Clickjacking attack — attacker overlays invisible iframe on your page
  res.setHeader('X-Frame-Options', 'DENY');

  // Tell browser to trust our declared content type, not sniff it
  // WHY: Attacker uploads a file with JS content but .jpg extension; browser might execute it
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Remove X-Powered-By (set by Express by default) — reveals tech stack
  // helmet does this too, but belt-and-suspenders
  res.removeHeader('X-Powered-By');

  // Expose correlation ID so clients can reference it in support requests
  const correlationId = req.headers['x-correlation-id'];
  if (correlationId) {
    res.setHeader('X-Correlation-ID', correlationId);
  }

  next();
};
