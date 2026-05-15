const { validateHerb } = require('../../src/utils/herbValidator');

describe('✓ Boundary Value Analysis - description (6 testes)', () => {
  describe('TU-H30 to TU-H35: Length Limits [0, 1000]', () => {
    it('TU-H30: accept 0 chars (lower boundary)', () => {
      const herb = { name: 'Basil', scientificName: 'Ocimum basilicum', description: '' };
      expect(validateHerb(herb).valid).toBe(true);
    });
    it('TU-H31: accept 1 char (lower + 1)', () => {
      const herb = { name: 'Basil', scientificName: 'Ocimum basilicum', description: 'A' };
      expect(validateHerb(herb).valid).toBe(true);
    });
    it('TU-H32: accept 500 chars (nominal)', () => {
      const herb = { name: 'Basil', scientificName: 'Ocimum basilicum', description: 'A'.repeat(500) };
      expect(validateHerb(herb).valid).toBe(true);
    });
    it('TU-H33: accept 1000 chars (upper boundary)', () => {
      const herb = { name: 'Basil', scientificName: 'Ocimum basilicum', description: 'A'.repeat(1000) };
      expect(validateHerb(herb).valid).toBe(true);
    });
    it('TU-H34: reject 1001 chars (upper + 1)', () => {
      const herb = { name: 'Basil', scientificName: 'Ocimum basilicum', description: 'A'.repeat(1001) };
      expect(() => validateHerb(herb)).toThrow('DESCRIPTION_TOO_LONG');
    });
    it('TU-H35: reject 5000 chars (excessive)', () => {
      const herb = { name: 'Basil', scientificName: 'Ocimum basilicum', description: 'A'.repeat(5000) };
      expect(() => validateHerb(herb)).toThrow('DESCRIPTION_TOO_LONG');
    });
  });
});