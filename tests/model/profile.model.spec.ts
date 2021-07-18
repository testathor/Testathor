import { isValidProfile, Profile } from '../../src/app/core/models/profile.model';

describe('isValidProfile', () => {
  it('returns false for a profile with no encodedText field', () => {
    const profile = { profileName: 'CATcher-org' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with an empty encodedText field', () => {
    const profile = { profileName: 'CATcher-org', encodedText: '' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with a malformed encodedText field', () => {
    const profile = { profileName: 'CATcher-org', encodedText: 'somestring' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with no profileName field', () => {
    const profile = { encodedText: 'public' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with an empty profileName field', () => {
    const profile = { profileName: '', encodedText: 'public' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns true for a valid profile with profileName and encodedText fields', () => {
    const profile = { profileName: 'CATcher-org', encodedText: 'CATcher/public' };
    expect(isValidProfile(profile as Profile)).toBe(true);
  });
});
