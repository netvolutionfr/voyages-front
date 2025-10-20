import { api } from "@/auth/api";
import type { Identity } from "@/auth/session";

export async function fetchMe(): Promise<Identity | null> {
    const res = await api.get<{ user: Identity }>("/me").catch(() => null);
    return res?.user ?? null;
}