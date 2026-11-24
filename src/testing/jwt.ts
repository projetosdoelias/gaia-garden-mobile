function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** An unsigned token for tests. */
export function makeToken(payload: object): string {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;
}

/** A token that expires `seconds` from now (negative: already expired). */
export function makeTokenExpiringIn(seconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  return makeToken({ userId: 1, username: 'ana', exp, jti: Math.random() });
}
