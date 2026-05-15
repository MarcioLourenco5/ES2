const { authorize } = require('../../src/middleware/auth.middleware');

describe('✓ Authorization Middleware - MC/DC (10 testes)', () => {
  describe('TU-H20 to TU-H29: Multiple Condition Coverage', () => {
    it('TU-H20: [C1=F,C2=F,C3=F] Técnico invalid → 401', () => {
      const m = authorize('Responsável', 'Administrador');
      const req = { user: { role: 'Técnico' }, headers: {} };
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(req, res, () => {});
      expect(res.status).toHaveBeenCalledWith(401);
    });
    it('TU-H21: [C1=F,C2=F,C3=T] Técnico valid → 403', () => {
      const m = authorize('Responsável', 'Administrador');
      const req = { user: { role: 'Técnico' }, headers: { authorization: 'Bearer token' } };
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(req, res, () => {});
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('TU-H22: [C1=F,C2=T,C3=F] Responsável invalid → 401', () => {
      const m = authorize('Responsável');
      const req = { user: { role: 'Responsável' }, headers: {} };
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(req, res, () => {});
      expect(res.status).toHaveBeenCalledWith(401);
    });
    it('TU-H23: [C1=F,C2=T,C3=T] Responsável valid → PASS', () => {
      const m = authorize('Responsável');
      const req = { user: { role: 'Responsável' }, headers: { authorization: 'Bearer token' } };
      const next = jest.fn();
      m(req, {}, next);
      expect(next).toHaveBeenCalled();
    });
    it('TU-H24: [C1=T,C2=F,C3=F] Admin invalid → 401', () => {
      const m = authorize('Administrador');
      const req = { user: { role: 'Administrador' }, headers: {} };
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(req, res, () => {});
      expect(res.status).toHaveBeenCalledWith(401);
    });
    it('TU-H25: [C1=T,C2=F,C3=T] Admin valid → PASS', () => {
      const m = authorize('Administrador');
      const req = { user: { role: 'Administrador' }, headers: { authorization: 'Bearer token' } };
      const next = jest.fn();
      m(req, {}, next);
      expect(next).toHaveBeenCalled();
    });
    it('TU-H26: MC/DC - C1 independência', () => {
      const m1 = authorize('Responsável');
      const m2 = authorize('Administrador');
      const req1 = { user: { role: 'Responsável' }, headers: { authorization: 'Bearer token' } };
      const req2 = { user: { role: 'Administrador' }, headers: { authorization: 'Bearer token' } };
      const n1 = jest.fn(), n2 = jest.fn();
      m1(req1, {}, n1);
      m2(req2, {}, n2);
      expect(n1).toHaveBeenCalled();
      expect(n2).toHaveBeenCalled();
    });
    it('TU-H27: MC/DC - C3 independência (token)', () => {
      const m = authorize('Administrador');
      const reqValid = { user: { role: 'Administrador' }, headers: { authorization: 'Bearer token' } };
      const reqInvalid = { user: { role: 'Administrador' }, headers: {} };
      const next = jest.fn();
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(reqValid, {}, next);
      expect(next).toHaveBeenCalled();
      m(reqInvalid, res, () => {});
      expect(res.status).toHaveBeenCalledWith(401);
    });
    it('TU-H28: reject unknown role', () => {
      const m = authorize('Administrador');
      const req = { user: { role: 'SuperAdmin' }, headers: { authorization: 'Bearer token' } };
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(req, res, () => {});
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('TU-H29: reject null role', () => {
      const m = authorize('Administrador');
      const req = { user: { role: null }, headers: { authorization: 'Bearer token' } };
      const res = { status: jest.fn().returnThis(), json: jest.fn() };
      m(req, res, () => {});
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});