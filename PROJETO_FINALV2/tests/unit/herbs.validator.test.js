const { validateHerb } = require('../../src/utils/herbValidator');

describe('✓ Herbs Validator - Equivalence Partitioning (9 testes)', () => {
  describe('TU-H01 to TU-H08: Field Validation', () => {
    describe('Field: name (obrigatório)', () => {
      it('TU-H01: reject empty name', () => {
        const herb = { name: '', scientificName: 'Mentha piperita' };
        expect(() => validateHerb(herb)).toThrow('NAME_REQUIRED');
      });
      it('TU-H02: reject null name', () => {
        const herb = { name: null, scientificName: 'Mentha piperita' };
        expect(() => validateHerb(herb)).toThrow('NAME_REQUIRED');
      });
      it('TU-H03: reject undefined name', () => {
        const herb = { scientificName: 'Mentha piperita' };
        expect(() => validateHerb(herb)).toThrow('NAME_REQUIRED');
      });
      it('TU-H04: accept valid name', () => {
        const herb = { name: 'Peppermint', scientificName: 'Mentha piperita' };
        expect(validateHerb(herb).valid).toBe(true);
      });
      it('TU-H05: accept name with hyphens', () => {
        const herb = { name: 'Red Hot Pepper-Mint', scientificName: 'Mentha piperita' };
        expect(validateHerb(herb).valid).toBe(true);
      });
      it('TU-H06: reject whitespace-only name', () => {
        const herb = { name: '    ', scientificName: 'Mentha piperita' };
        expect(() => validateHerb(herb)).toThrow('NAME_INVALID');
      });
    });
    describe('Field: scientificName (obrigatório)', () => {
      it('TU-H07: reject empty scientificName', () => {
        const herb = { name: 'Peppermint', scientificName: '' };
        expect(() => validateHerb(herb)).toThrow('SCIENTIFIC_NAME_REQUIRED');
      });
      it('TU-H08: reject null scientificName', () => {
        const herb = { name: 'Peppermint', scientificName: null };
        expect(() => validateHerb(herb)).toThrow('SCIENTIFIC_NAME_REQUIRED');
      });
    });
    it('TU-H09: validate name before scientificName', () => {
      const herb = { name: '', scientificName: '' };
      expect(() => validateHerb(herb)).toThrow('NAME_REQUIRED');
    });
  });
});