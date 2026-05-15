const { parseCSVLine, parseCSVFile } = require('../../src/utils/csvParser');

describe('✓ CSV Parser - Equivalence Partitioning (10 testes)', () => {
  describe('TU-H10 to TU-H18: Parse CSV Lines', () => {
    it('TU-H10: parse valid CSV line', () => {
      const line = 'Basil,Ocimum basilicum,Sweet fragrant herb';
      const result = parseCSVLine(line);
      expect(result.name).toBe('Basil');
      expect(result.scientificName).toBe('Ocimum basilicum');
    });
    it('TU-H11: parse CSV with quoted fields', () => {
      const line = '"Lemon Basil","Ocimum americanum","Desc, with comma"';
      const result = parseCSVLine(line);
      expect(result.name).toBe('Lemon Basil');
    });
    it('TU-H12: trim whitespace', () => {
      const line = '  Basil  ,  Ocimum basilicum  ,  Sweet  ';
      const result = parseCSVLine(line);
      expect(result.name).toBe('Basil');
    });
    it('TU-H13: reject missing fields', () => {
      expect(() => parseCSVLine('Basil,')).toThrow();
    });
    it('TU-H14: reject empty name', () => {
      expect(() => parseCSVLine(',Ocimum basilicum,Desc')).toThrow();
    });
    it('TU-H15: reject whitespace-only', () => {
      expect(() => parseCSVLine('   ,   ,   ')).toThrow();
    });
    it('TU-H16: handle special characters', () => {
      const line = 'Basil™,Ocimum basilicum,Herb';
      const result = parseCSVLine(line);
      expect(result.name).toContain('Basil');
    });
    it('TU-H17: sanitize SQL injection', () => {
      const line = "'; DROP TABLE herbs;--,Ocimum basilicum,Desc";
      const result = parseCSVLine(line);
      expect(result.sanitized).toBe(true);
    });
    it('TU-H18: accept empty description', () => {
      const line = 'Basil,Ocimum basilicum,';
      const result = parseCSVLine(line);
      expect(result.description).toBe('');
    });
  });
  describe('TU-H19: Batch Processing', () => {
    it('TU-H19: count valid and invalid lines', () => {
      const csvContent = `Basil,Ocimum basilicum,Sweet\n,Ocimum americanum,Invalid\nMint,Mentha piperita,`;
      const result = parseCSVFile(csvContent);
      expect(result.valid).toBeGreaterThan(0);
    });
  });
});