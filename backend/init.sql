CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    senha CHAR(60) NOT NULL
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    id_usuario INT REFERENCES usuarios(id),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);