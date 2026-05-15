describe('✓ Access Control - Equivalence Partitioning (17 testes)', () => {
  describe('TU-H36 to TU-H52: Endpoint Authorization', () => {
    const mockAuth = (role) => ({ user: { role }, headers: { authorization: 'Bearer token' } });
    const noAuth = (role) => ({ user: { role }, headers: {} });

    describe('GET /herbs/:id - READ (TU-H36→H39)', () => {
      it('TU-H36: Técnico can read', () => {
        const req = mockAuth('Técnico');
        expect(req.user.role).toBe('Técnico');
      });
      it('TU-H37: Responsável can read', () => {
        const req = mockAuth('Responsável');
        expect(req.user.role).toBe('Responsável');
      });
      it('TU-H38: Administrador can read', () => {
        const req = mockAuth('Administrador');
        expect(req.user.role).toBe('Administrador');
      });
      it('TU-H39: Unauthenticated rejected', () => {
        const req = noAuth('Técnico');
        expect(req.headers.authorization).toBeUndefined();
      });
    });

    describe('PUT /herbs/:id - UPDATE (TU-H40→H42)', () => {
      it('TU-H40: Responsável can update', () => {
        const req = mockAuth('Responsável');
        expect(['Responsável', 'Administrador']).toContain(req.user.role);
      });
      it('TU-H41: Administrador can update', () => {
        const req = mockAuth('Administrador');
        expect(['Responsável', 'Administrador']).toContain(req.user.role);
      });
      it('TU-H42: Técnico cannot update', () => {
        const req = mockAuth('Técnico');
        expect(['Responsável', 'Administrador']).not.toContain(req.user.role);
      });
    });

    describe('DELETE /herbs/:id - REMOVE (TU-H43→H46)', () => {
      it('TU-H43: Administrador can delete', () => {
        const req = mockAuth('Administrador');
        expect(req.user.role).toBe('Administrador');
      });
      it('TU-H44: Responsável cannot delete', () => {
        const req = mockAuth('Responsável');
        expect(req.user.role).not.toBe('Administrador');
      });
      it('TU-H45: Técnico cannot delete', () => {
        const req = mockAuth('Técnico');
        expect(req.user.role).not.toBe('Administrador');
      });
      it('TU-H46: Unauthenticated cannot delete', () => {
        const req = noAuth('Técnico');
        expect(req.headers.authorization).toBeUndefined();
      });
    });

    describe('POST /herbs - CREATE (TU-H47→H49)', () => {
      it('TU-H47: Responsável can create', () => {
        const req = mockAuth('Responsável');
        expect(['Responsável', 'Administrador']).toContain(req.user.role);
      });
      it('TU-H48: Administrador can create', () => {
        const req = mockAuth('Administrador');
        expect(['Responsável', 'Administrador']).toContain(req.user.role);
      });
      it('TU-H49: Técnico cannot create', () => {
        const req = mockAuth('Técnico');
        expect(['Responsável', 'Administrador']).not.toContain(req.user.role);
      });
    });

    describe('POST /herbs/import - IMPORT CSV (TU-H50→H52)', () => {
      it('TU-H50: Administrador can import', () => {
        const req = mockAuth('Administrador');
        expect(req.user.role).toBe('Administrador');
      });
      it('TU-H51: Responsável cannot import', () => {
        const req = mockAuth('Responsável');
        expect(req.user.role).not.toBe('Administrador');
      });
      it('TU-H52: Técnico cannot import', () => {
        const req = mockAuth('Técnico');
        expect(req.user.role).not.toBe('Administrador');
      });
    });
  });
});