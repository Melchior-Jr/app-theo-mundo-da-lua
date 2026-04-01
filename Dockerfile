# Estágio 1: Build da aplicação
FROM node:20-alpine as builder

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o resto do código da aplicação
COPY . .

# Injeta as variáveis de ambiente necessárias para o build do Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Faz o build (a saída geralmente vai para a pasta dist/ no Vite)
RUN npm run build

# Estágio 2: Subir o servidor Nginx para distribuição dos estáticos
FROM nginx:alpine

# Copia as configurações do nginx para lidar com rotas de SPA (React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos que passaram pelo build no estágio 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
