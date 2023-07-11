//Módulos utilizados
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');

//Gerar chave de sessão criptografada
const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

//Gerar chave de senha criptografada
const generatePasswordSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

//Setup para usar o express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Setup para usar cryto em sessões
const sessionSecret = generateSessionSecret();

//Uso de sessões
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
  })
);

//Informações do db
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'techgreen'
});

//Conexão ao db
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conectado ao banco de dados MySQL');
});

//Iniciar o servidor em localhost:3000
app.listen(3000, (err) => {
  if (err) {
    console.error('Erro ao iniciar o servidor:', err);
  } else {
    console.log('Servidor rodando na porta 3000');
  }
});

//Preparar para pegar arquivos dentro da pasta 'public'
app.use(express.static('public'));

//Rota de enviar feedback ao db
app.post('/enviar-feedback', (req, res) => {
  //Pegar variáveis do site
  const { email, nota, comentario } = req.body;
  //Sintaxe mysql
  const sql = 'INSERT INTO feedbacks (nota, comentario, email) VALUES (?, ?, ?)';
  const values = [nota, comentario, email];

  //Tentar fazer o insert no db
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados no banco de dados:', err);
      res.status(500).json({ error: 'Erro ao enviar dados de feedback' });
      return;
    }

    console.log('Dados de feedback inseridos no banco de dados');
    res.status(200).json({ message: 'Dados de feedback enviados com sucesso' });
  });
});

//Rota de enviar novos Cadastros
app.post('/enviar-cadastro', (req, res) => {
  const { nome, email, cep, senha } = req.body;
  //criptografar senha
  const encryptedPassword = encryptPassword(senha);

  const sql = 'INSERT INTO usuarios (nome, email, cep, senha) VALUES (?, ?, ?, ?)';
  const values = [nome, email, cep, encryptedPassword];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados no banco de dados:', err);
      res.status(500).json({ error: 'Erro ao enviar dados de pc' });
      return;
    }

    console.log('Dados de usuario inseridos no banco de dados');
    res.status(200).json({ message: 'Dados de usuario enviados com sucesso' });
  });
});

//Rota de fazer Login
app.post('/login', (req, res) => {
  const{ email, senha } = req.body;
  //criptografia
  const encryptedPassword = encryptPassword(senha);

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  const values = [email, encryptedPassword];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Erro ao consultar login:', err);
      res.status(500).json({ error: 'Erro ao consultar login' });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ error: 'Credenciais inválidas' });
    } else {
      const usuario = results[0];

      //Iniciar sessão
      req.session.usuario = usuario;
      res.status(200).json(usuario);
    }
  });
});

//Rota de Verificar se email existe no db
app.post('/verificar-email', (req, res) => {
  const { email } = req.body;
  const sql = 'SELECT COUNT(*) AS count FROM usuarios WHERE email = ?';
  const values = [email];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao consultar email no banco de dados:', err);
      res.status(500).json({ error: 'Erro ao verificar email' });
      return;
    }

    const count = result[0].count;
    const emailExists = count > 0;

    res.status(200).json({ emailExists });
  });
});

//Verificar se o login foi autorizado
const verificaAutenticacao = (req, res, next) => {
  if (req.session.usuario) {
    next();
  } else {
    res.status(401).json({ error: 'Acesso não autorizado' });
  }
};

//Verificar se o usuário é um Administrador autorizado
const verificaAutenticacaoAdmin = (req, res, next) => {
  const usuario = req.session.usuario;
  if (usuario && usuario.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Acesso não autorizado' });
  }
};


//Rota de enviar novos Pontos de Coleta apenas para Admins
app.post('/enviar-coleta', verificaAutenticacaoAdmin, (req, res) => {
  const { dbNome, dbCep } = req.body;
  const sql = 'INSERT INTO pontosColeta (nome, cep) VALUES (?, ?)';
  const values = [dbNome, dbCep];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados no banco de dados:', err);
      res.status(500).json({ error: 'Erro ao enviar dados de pc' });
      console.log('Dados de pc nao inseridos no banco de dados');
      return;
    }

    console.log('Dados de pc inseridos no banco de dados');
    res.status(200).json({ message: 'Dados de pc enviados com sucesso' });
  });
});

//Rota para retornar as informações do usuário logado
app.get('/usuario', verificaAutenticacao, (req, res) => {
  //Acessar os dados do usuário na sessão
  const usuario = req.session.usuario;
  res.json(usuario);
});

//Rota para obter os pontos de coleta
app.get('/pontos-coleta', (req, res) => {
  const sql = 'SELECT * FROM pontosColeta';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao consultar pontos de coleta:', err);
      res.status(500).json({ error: 'Erro ao consultar pontos de coleta' });
      return;
    }

    res.status(200).json(results);
  });
});

//Rota de redefinir senha
app.post('/redefinir-senha', (req, res) => {
  const { email, senha, cep } = req.body;
  const sql = 'UPDATE usuarios SET senha = ? WHERE email = ? AND cep = ?';
  const values = [senha, email, cep];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao redefinir senha:', err);
      res.status(500).json({ error: 'Erro ao redefinir senha' });
      return;
    }

    if (result.affectedRows === 0) {
      console.log('Nenhuma senha redefinida no banco de dados');
      res.status(400).json({ error: 'Falha ao redefinir senha. Verifique as credenciais fornecidas.' });
      return;
    }

    console.log('Senha redefinida no banco de dados');
    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  });
});

//Rota para obter os feedbacks apenas para Admins
app.get('/feedbacks', verificaAutenticacaoAdmin, (req, res) => {
  const sql = 'SELECT * FROM feedbacks';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao consultar feedbacks:', err);
      res.status(500).json({ error: 'Erro ao consultar feedbacks' });
      return;
    }

    res.status(200).json(results);
  });
});

const passwordSecret = generatePasswordSecret();
//Função para criptografar a senha
const encryptPassword = (password) => {
  const secret = passwordSecret; // Substitua com sua própria chave secreta
  const cipher = crypto.createCipher('aes256', secret);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};




//Propriedade de ©TechGrenn, Todos os direitos reservados, 2023