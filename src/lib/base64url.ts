export const b64urlToArrayBuffer = (b64url: string): ArrayBuffer => {
    const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
    const base64 = (b64url.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes.buffer;
};

export const arrayBufferToB64url = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export function base64urlToBuffer(base64url: string): Uint8Array {
    const b64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const str = atob(b64 + pad);
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
    return bytes;
}


export function bufferToBase64url(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
