const measurementsController = require('../../src/controllers/measurements.controller');
const batchesController = require('../../src/controllers/batches.controller');
const reportsController = require('../../src/controllers/reports.controller');
const usersController = require('../../src/controllers/users.controller');
const plansController = require('../../src/controllers/plans.controller');
const alertsController = require('../../src/controllers/alerts.controller');
const plansService = require('../../src/services/plans.service');
const auditService = require('../../src/services/auditService');
const { authorize } = require('../../src/middleware/auth.middleware');
const data = require('../../src/data/mockData');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const initialState = {
  users: clone(data.users),
  plans: clone(data.plans),
  batches: clone(data.batches),
  measurements: clone(data.measurements),
  alerts: clone(data.alerts),
  reports: clone(data.reports),
  auditLogs: clone(data.auditLogs),
};

function restoreArray(target, source) {
  target.splice(0, target.length, ...clone(source));
}

function restoreMockData() {
  restoreArray(data.users, initialState.users);
  restoreArray(data.plans, initialState.plans);
  restoreArray(data.batches, initialState.batches);
  restoreArray(data.measurements, initialState.measurements);
  restoreArray(data.alerts, initialState.alerts);
  restoreArray(data.reports, initialState.reports);
  restoreArray(data.auditLogs, initialState.auditLogs);
}

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    send(payload) { this.body = payload; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
  };
}

function authenticatedReq(overrides = {}) {
  return { user: { id: 1, role: 'Administrador' }, ...overrides };
}

describe('melhorias Sprint 3 — validação, auditoria, autorização e exportação', () => {
  beforeEach(() => {
    restoreMockData();
    jest.restoreAllMocks();
  });

  describe('Auditoria integrada nos controllers', () => {
    test('criar plano chama auditService.log', () => {
      const spy = jest.spyOn(auditService, 'log');
      const req = authenticatedReq({
        body: {
          herbId: 1,
          type: 'regular',
          name: 'Plano com auditoria',
          temperature: { min: 18, max: 28 },
          humidity: { min: 40, max: 80 },
          luminosity: { min: 5000, max: 25000 },
          cycleDays: 90,
        },
      });
      const res = mockRes();

      plansController.create(req, res);

      expect(res.statusCode).toBe(201);
      expect(spy).toHaveBeenCalledWith(1, 'CREATE_PLAN', 'POST /plans', expect.objectContaining({ type: 'regular' }));
    });

    test('aplicar plano a lote chama auditService.log', () => {
      const spy = jest.spyOn(auditService, 'log');
      const req = authenticatedReq({ params: { id: '1' }, body: { planId: 1 } });
      const res = mockRes();

      batchesController.applyPlan(req, res);

      expect(res.statusCode).toBe(200);
      expect(spy).toHaveBeenCalledWith(1, 'APPLY_PLAN_TO_BATCH', 'POST /batches/:id/apply-plan', expect.objectContaining({ batchId: 1, planId: 1 }));
    });

    test('resolver alerta chama auditService.log', () => {
      const spy = jest.spyOn(auditService, 'log');
      const req = authenticatedReq({ params: { id: '1' }, body: { justification: 'Resolvido após verificação técnica.' } });
      const res = mockRes();

      alertsController.resolve(req, res);

      expect(res.statusCode).toBe(200);
      expect(spy).toHaveBeenCalledWith(1, 'RESOLVE_ALERT', 'PATCH /alerts/:id/resolve', expect.objectContaining({ alertId: 1 }));
    });

    test('ignorar alerta chama auditService.log', () => {
      const spy = jest.spyOn(auditService, 'log');
      const req = authenticatedReq({ params: { id: '1' }, body: { justification: 'Falso positivo confirmado.' } });
      const res = mockRes();

      alertsController.ignore(req, res);

      expect(res.statusCode).toBe(200);
      expect(spy).toHaveBeenCalledWith(1, 'IGNORE_ALERT', 'PATCH /alerts/:id/ignore', expect.objectContaining({ alertId: 1 }));
    });

    test('gerar relatório chama auditService.log', () => {
      const spy = jest.spyOn(auditService, 'log');
      const req = authenticatedReq({ body: { type: 'batch_summary', format: 'CSV', batchId: 1 } });
      const res = mockRes();

      reportsController.generate(req, res);

      expect(res.statusCode).toBe(201);
      expect(spy).toHaveBeenCalledWith(1, 'GENERATE_REPORT', 'POST /reports', expect.objectContaining({ type: 'batch_summary', format: 'CSV' }));
    });
  });

  describe('Tipos inválidos em medições', () => {
    test('temperature: "22" → erro 400', () => {
      const req = authenticatedReq({ body: { batchId: 1, temperature: '22', humidity: 60, luminosity: 15000 } });
      const res = mockRes();
      measurementsController.create(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('humidity: null → erro 400', () => {
      const req = authenticatedReq({ body: { batchId: 1, temperature: 22, humidity: null, luminosity: 15000 } });
      const res = mockRes();
      measurementsController.create(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('luminosity: [] → erro 400', () => {
      const req = authenticatedReq({ body: { batchId: 1, temperature: 22, humidity: 60, luminosity: [] } });
      const res = mockRes();
      measurementsController.create(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('batchId: "abc" → erro 400', () => {
      const req = authenticatedReq({ body: { batchId: 'abc', temperature: 22, humidity: 60, luminosity: 15000 } });
      const res = mockRes();
      measurementsController.create(req, res);
      expect(res.statusCode).toBe(400);
    });

    test('batchId inexistente → erro 404', () => {
      const req = authenticatedReq({ body: { batchId: 999, temperature: 22, humidity: 60, luminosity: 15000 } });
      const res = mockRes();
      measurementsController.create(req, res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Produtividade e perdas inválidas', () => {
    test('losses > quantity deve ser rejeitado', () => {
      const req = authenticatedReq({ params: { id: '1' }, body: { losses: 101 } });
      const res = mockRes();
      batchesController.registerLoss(req, res);
      expect(res.statusCode).toBe(422);
    });

    test('quantity = 0 deve ser rejeitado no cálculo de produtividade', () => {
      data.batches.push({ id: 77, planId: 1, herbId: 1, status: 'concluído', quantity: 0, losses: 0, endDate: '2025-01-31' });
      const req = authenticatedReq({ params: { id: '77' } });
      const res = mockRes();
      batchesController.calculateProductivity(req, res);
      expect(res.statusCode).toBe(422);
    });

    test('losses não numérico deve ser rejeitado no registo de perdas', () => {
      const req = authenticatedReq({ params: { id: '1' }, body: { losses: 'dez' } });
      const res = mockRes();
      batchesController.registerLoss(req, res);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Plano pontual', () => {
    const pontualValido = {
      herbId: 1,
      type: 'pontual',
      name: 'Plano pontual',
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 80 },
      luminosity: { min: 5000, max: 25000 },
      cycleDays: 90,
    };

    test('authorizedBy deve corresponder a Responsável Técnico ativo', () => {
      const result = plansService.validatePlan({ ...pontualValido, authorizedBy: 2 });
      expect(result.valid).toBe(true);
    });

    test('authorizedBy inexistente deve ser rejeitado', () => {
      const result = plansService.validatePlan({ ...pontualValido, authorizedBy: 999 });
      expect(result.valid).toBe(false);
      expect(result.status).toBe(403);
    });

    test('authorizedBy de Técnico deve ser rejeitado', () => {
      const result = plansService.validatePlan({ ...pontualValido, authorizedBy: 3 });
      expect(result.valid).toBe(false);
      expect(result.status).toBe(403);
    });
  });

  describe('Controlo de acesso por perfil', () => {
    test('Técnico tenta criar utilizador → 403', () => {
      const req = { user: { id: 3, role: 'Técnico' } };
      const res = mockRes();
      const next = jest.fn();
      authorize('Administrador')(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('Responsável tenta criar utilizador → 403', () => {
      const req = { user: { id: 2, role: 'Responsável' } };
      const res = mockRes();
      const next = jest.fn();
      authorize('Administrador')(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('Admin cria utilizador → permitido pelo middleware', () => {
      const req = { user: { id: 1, role: 'Administrador' } };
      const res = mockRes();
      const next = jest.fn();
      authorize('Administrador')(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    test('Técnico tenta criar plano → 403', () => {
      const req = { user: { id: 3, role: 'Técnico' } };
      const res = mockRes();
      const next = jest.fn();
      authorize('Responsável', 'Administrador')(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('Responsável cria plano → permitido pelo middleware', () => {
      const req = { user: { id: 2, role: 'Responsável' } };
      const res = mockRes();
      const next = jest.fn();
      authorize('Responsável', 'Administrador')(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    test('Administrador cria plano → permitido pelo middleware', () => {
      const req = { user: { id: 1, role: 'Administrador' } };
      const res = mockRes();
      const next = jest.fn();
      authorize('Responsável', 'Administrador')(req, res, next);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Reports', () => {
    test('exportação Excel devolve conteúdo compatível com Excel e não JSON', () => {
      data.reports.push({ id: 99, type: 'batch_summary', format: 'Excel', generatedAt: '2025-01-01', generatedBy: 1, batchId: 1 });
      const req = authenticatedReq({ params: { id: '99' } });
      const res = mockRes();

      reportsController.exportReport(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toContain('application/vnd.ms-excel');
      expect(res.body).toContain('<Workbook');
      expect(res.body).toContain('<Worksheet');
      expect(res.body).not.toMatch(/^\s*\{/);
    });
  });

  describe('Users', () => {
    test('criação de utilizador guarda passwordHash e não devolve password', () => {
      const req = authenticatedReq({ body: { username: 'novo', password: 'Teste@123', role: 'Técnico' } });
      const res = mockRes();

      usersController.create(req, res);

      expect(res.statusCode).toBe(201);
      const created = data.users.find(u => u.username === 'novo');
      expect(created.passwordHash).toBeDefined();
      expect(res.body.password).toBeUndefined();
      expect(res.body.passwordHash).toBeUndefined();
    });
  });
});
