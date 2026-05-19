/** Breaks circular dependency between api.client and useAppStore. */
let sessionToken: string | null = null;

export function setApiSessionToken(token: string | null): void {
  sessionToken = token;
}

export function getApiSessionToken(): string | null {
  return sessionToken;
}
