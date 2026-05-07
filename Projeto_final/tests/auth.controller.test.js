const { loginLogic } = require('../controllers/auth.controller');

describe('Testes de Unidade: Controlador de Autenticação (TU-AUTH)', () => {

    // TU-AUTH-01
    test('TU-AUTH-01: Deve permitir login com credenciais corretas de Administrador', () => {
        const result = loginLogic('admin', 'Password123!');
        
        expect(result.status).toBe(200);
        expect(result.body.message).toBe('Autenticação bem sucedida');
        expect(result.body.profile).toBe('Administrador');
        expect(result.body.token).toBeDefined();
    });

    // TU-AUTH-02
    test('TU-AUTH-02: Deve permitir login com credenciais corretas de Técnico', () => {
        const result = loginLogic('tecnico1', 'TechPassword!');
        
        expect(result.status).toBe(200);
        expect(result.body.profile).toBe('Técnico');
    });

    // TU-AUTH-03
    test('TU-AUTH-03: Deve rejeitar login com password incorreta', () => {
        const result = loginLogic('admin', 'PasswordErrada!');
        
        expect(result.status).toBe(401);
        expect(result.body.error).toBe('Credenciais inválidas.');
    });

    // TU-AUTH-04
    test('TU-AUTH-04: Deve rejeitar login com utilizador inexistente', () => {
        const result = loginLogic('utilizador_fantasma', 'Password123!');
        
        expect(result.status).toBe(401);
        expect(result.body.error).toBe('Credenciais inválidas.');
    });

    // TU-AUTH-05
    test('TU-AUTH-05: Deve rejeitar login com username vazio', () => {
        const result = loginLogic('', 'Password123!');
        
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Username e password são obrigatórios.');
    });

    test('TU-AUTH-06: Deve rejeitar login com password vazia', () => {
        const result = loginLogic('admin', '');
        
        expect(result.status).toBe(400);
        expect(result.body.error).toBe('Username e password são obrigatórios.');
    });
});