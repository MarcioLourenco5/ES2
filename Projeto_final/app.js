const express = require('express');
const app = express();

app.use(express.json());

// Importação dos controladores (apenas o auth está detalhado neste sprint)
const authController = require('./controllers/auth.controller');

// ==========================================
// Endpoints da Plataforma GREENHERB
// ==========================================

// Autenticação, emissão e renovação de tokens
app.post('/auth/login', authController.login); 

// Gestão de utilizadores e perfis (Técnico, Responsável, Administrador)
app.post('/users', (req, res) => res.status(201).send('Not implemented')); 

// Catálogo de ervas aromáticas
app.get('/herbs', (req, res) => res.status(200).send('Not implemented')); 

// Planos de cultivo
app.post('/plans', (req, res) => res.status(201).send('Not implemented')); 

// Lotes de cultivo
app.get('/batches', (req, res) => res.status(200).send('Not implemented')); 

// Tarefas operacionais
app.post('/tasks', (req, res) => res.status(201).send('Not implemented')); 

// Medições ambientais
app.post('/measurements', (req, res) => res.status(201).send('Not implemented')); 

// Alertas
app.get('/alerts', (req, res) => res.status(200).send('Not implemented')); 

// Automação
app.patch('/automation', (req, res) => res.status(200).send('Not implemented')); 

// Relatórios
app.get('/reports', (req, res) => res.status(200).send('Not implemented')); 

// Logs de auditoria
app.get('/audit', (req, res) => res.status(200).send('Not implemented')); 

module.exports = app;