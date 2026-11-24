import { makeToken } from '@/testing/jwt';

import { decodeJwtExp } from '../jwt';

describe('decodeJwtExp', () => {
  it('returns exp in epoch ms', () => {
    expect(decodeJwtExp(makeToken({ exp: 1_700_000_000 }))).toBe(1_700_000_000_000);
  });

  it('handles base64url characters', () => {
    expect(decodeJwtExp(makeToken({ name: '~~~???', exp: 42 }))).toBe(42_000);
  });

  it.each([{}, { exp: 'soon' }])('returns null for payload %j', (payload) => {
    expect(decodeJwtExp(makeToken(payload))).toBeNull();
  });

  it.each(['', 'garbage', 'a.b', 'a.!!!.c', 'a..c', 'a.b.c.d'])(
    'returns null for malformed token %j',
    (token) => {
      expect(decodeJwtExp(token)).toBeNull();
    },
  );
});
