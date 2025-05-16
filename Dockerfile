# Use uma imagem base do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Construa a aplicação Next.js
RUN npm run build

# Exponha a porta que a aplicação utiliza (geralmente 3000 para Next.js)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]