// src/auth/csrf.ts
// Helper CSRF unique pour tous les appels qui s'appuient sur le cookie httpOnly
// (refresh, logout, WebAuthn) : reflète le cookie XSRF-TOKEN en en-tête X-XSRF-TOKEN.

export function readCookie(name: string): string | null {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
}

export function xsrfHeader(): Record<string, string> {
    const token = readCookie("XSRF-TOKEN");
    return token ? { "X-XSRF-TOKEN": token } : {};
}
