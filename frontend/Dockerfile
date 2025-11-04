FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expõe a porta 5173 (padrão do Vite)
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]