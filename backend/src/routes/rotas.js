const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const senhaTokenJWT = "senhaSecretissimaIFSP";

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: API de Autenticação e Mensagens
 *   version: 1.0.0
 *   description: >
 *     Esta API permite autenticação de usuários via JWT, cadastro de usuários e envio de mensagens.
 *     Requer um token JWT válido para acessar endpoints protegidos.
 * servers:
 *   - url: http://localhost:3000
 *     description: Servidor local de desenvolvimento
 *
 * tags:
 *   - name: Autenticação
 *     description: Endpoints para login e validação de token
 *   - name: Usuários
 *     description: Operações de listagem e cadastro de usuários
 *   - name: Mensagens
 *     description: Operações relacionadas a mensagens (necessita autenticação)
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         login:
 *           type: string
 *         senha:
 *           type: string
 *           description: Hash bcrypt da senha
 *     Mensagem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         texto:
 *           type: string
 *         id_usuario:
 *           type: integer
 *         data:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Token inválido ou ausente
 *       content:
 *         application/json:
 *           example:
 *             msg: Token inválido
 *     ServerError:
 *       description: Erro interno no servidor
 *       content:
 *         application/json:
 *           example:
 *             msg: erro de servidor
 */

router.get("/", (req, res) => {
  return res.send(
    "<a href='http://localhost:3000/docs'>Acesse a documentação aqui</a> para entender o backend"
  );
});

// Função middleware que recebe o token do usuário, verifica se é válido e de um usuário permitido. Se der erro, bloqueia a requisição.
function verificarToken(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ msg: "Token inválido" });
    }

    jwt.verify(token, senhaTokenJWT, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Token inválido" });
      }
      // Token parece válido, mas será que o usuário existe???
      const r = await db.query("SELECT COUNT(*) as qtde FROM usuarios WHERE id = $1", [
        decoded.data,
      ]);
      if (!r.rows[0].qtde) {
        // O usuário não existe mais no banco. Nega o acesso.
        return res.status(403).json({ msg: "Token inválido" });
      }
      // Tudo certo... Coloca em req.user o ID do usuário logado.
      req.user = decoded.data;
      next();
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

/**
 * @swagger
 * /msg:
 *   get:
 *     summary: Lista as mensagens do usuário autenticado
 *     tags: [Mensagens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensagens do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensagem'
 *       403:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Cadastra uma nova mensagem para o usuário autenticado
 *     tags: [Mensagens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texto
 *             properties:
 *               texto:
 *                 type: string
 *                 example: "Olá, mundo!"
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Texto ausente ou inválido
 *         content:
 *           application/json:
 *             example:
 *               msg: "Texto não encontrado"
 *       403:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/msg", verificarToken, async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM mensagens WHERE id_usuario = $1", [req.user]);
    return res.json(r.rows);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/msg", verificarToken, async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) {
      return res.status(400).json({ msg: "Texto não encontrado" });
    }
    const r = await db.query(
      "INSERT INTO mensagens(texto, id_usuario) VALUES ($1, $2) RETURNING *",
      [texto, req.user]
    );
    if (r.rows.length == 0) {
      return res.status(500).json({ msg: "Erro ao cadastrar mensagem" });
    }
    return res.status(201).json(r.rows[0]);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Lista usuários cadastrados
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Cadastra um novo usuário
 *     description: Requer login e senha no corpo da requisição. O login deve ser único.
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - senha
 *             properties:
 *               login:
 *                 type: string
 *                 example: "usuario1"
 *               senha:
 *                 type: string
 *                 example: "minhasenha"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Login já existente ou dados inválidos
 *         content:
 *           application/json:
 *             example:
 *               msg: Login já existente
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/user", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM usuarios");
    res.status(200).json(r.rows);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/user", async (req, res) => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(404).json({ msg: "Login ou senha inválidos" });
    }
    const resultado = await db.transaction(async (conexao) => {
      const existe = await conexao.query("SELECT COUNT(*) as qtde FROM usuarios WHERE login = $1", [
        login,
      ]);
      if (existe.rows[0].qtde > 0) {
        throw new Error("Login já existente");
      }
      const hash = await bcrypt.hash(senha, 10);
      const novo = await conexao.query(
        "INSERT INTO usuarios (login, senha) VALUES ($1, $2) RETURNING *",
        [login, hash]
      );
      return novo.rows[0];
    });

    return res.status(201).json(resultado);
  } catch (error) {
    if (error.message == "Login já existente") {
      return res.status(400).json({ msg: error.message });
    }
    return res.status(500).json({ msg: error.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza autenticação do usuário
 *     description: Retorna um token JWT válido por 60 minutos, se as credenciais estiverem corretas.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - senha
 *             properties:
 *               login:
 *                 type: string
 *                 example: "usuario1"
 *               senha:
 *                 type: string
 *                 example: "minhasenha"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               msg: Login realizado com sucesso
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               id: 1
 *       400:
 *         description: Credenciais incorretas
 *         content:
 *           application/json:
 *             example:
 *               msg: "Senha incorreta!"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/login", async (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(404).json({ msg: "Login ou senha não encontrados" });
    }

    const r = await db.query("SELECT * FROM usuarios WHERE login = $1", [login]);
    if (r.rows.length == 0) {
      return res.status(400).json({ msg: "Login inválido" });
    }
    const confere = await bcrypt.compare(senha, r.rows[0].senha);
    if (!confere) {
      return res.status(400).json({ msg: "Senha incorreta!" });
    }

    // Login bem sucedido. Cria o token JWT e retorna ao usuário.
    let jwtAssinado = await jwt.sign({ data: r.rows[0].id }, senhaTokenJWT, {
      expiresIn: "60m",
      subject: r.rows[0].login,
    });
    return res
      .status(200)
      .json({ msg: "Login realizado com sucesso", token: jwtAssinado, id: r.rows[0].id });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
