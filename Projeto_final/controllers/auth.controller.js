// Mock de utilizadores na "Base de Dados"
const mockUsers = [
    { username: 'admin', password: 'Password123!', profile: 'Administrador' },
    { username: 'tecnico1', password: 'TechPassword!', profile: 'Técnico' },
    { username: 'resp1', password: 'RespPassword!', profile: 'Responsável' }
];

// Função do Controlador isolada para ser testada unitariamente
const loginLogic = (username, password) => {
    // Validação de inputs vazios ou nulos
    if (!username || !password) {
        return { status: 400, body: { error: 'Username e password são obrigatórios.' } };
    }

    // Procura no mock de dados
    const user = mockUsers.find(u => u.username === username);

    // Validação de credenciais
    if (!user || user.password !== password) {
        return { status: 401, body: { error: 'Credenciais inválidas.' } };
    }

    // Sucesso - Emulação de geração de JWT
    const mockJwtToken = `header.payload.${user.profile}_signature`;
    
    return { 
        status: 200, 
        body: { 
            message: 'Autenticação bem sucedida', 
            token: mockJwtToken,
            profile: user.profile
        } 
    };
};

// Wrapper para o Express
const login = (req, res) => {
    const { username, password } = req.body;
    const result = loginLogic(username, password);
    res.status(result.status).json(result.body);
};

module.exports = { login, loginLogic, mockUsers };