import { ScanFilterService, ScanFilterSettings } from './scan-filter.service';

describe('ScanFilterService', () => {
  const service = new ScanFilterService();
  const enabled = (changes: Partial<ScanFilterSettings> = {}): ScanFilterSettings => ({
    enabled: true,
    prefix: '',
    suffix: '',
    exactLength: null,
    ...changes,
  });

  it('accepts every value while the filter is disabled', () => {
    expect(service.matches('ANY', { ...enabled({ prefix: 'CF' }), enabled: false })).toBeTrue();
  });

  it('combines prefix, suffix and exact character length', () => {
    const settings = enabled({ prefix: 'CF', suffix: '99', exactLength: 8 });
    expect(service.matches('CF123499', settings)).toBeTrue();
    expect(service.matches('XX123499', settings)).toBeFalse();
    expect(service.matches('CF123498', settings)).toBeFalse();
    expect(service.matches('CF1299', settings)).toBeFalse();
  });

  it('treats uppercase and lowercase as different characters', () => {
    expect(service.matches('cf123', enabled({ prefix: 'CF' }))).toBeFalse();
  });

  it('counts spaces and symbols as characters', () => {
    expect(service.matches('A 1-', enabled({ exactLength: 4 }))).toBeTrue();
  });
});
