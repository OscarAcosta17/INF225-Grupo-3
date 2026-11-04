FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Instalar wait-port globalmente para entornos locales que lo requieran
RUN npm install -g wait-port

# Si no hay DATABASE_URL y existe DB_HOST, esperamos a la base de datos local.
# Si estamos en Render (DATABASE_URL definida), iniciamos de inmediato.
CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ] && [ -n \"$DB_HOST\" ]; then wait-port ${DB_HOST}:${DB_PORT:-5432}; fi; node initDB.js && node index.js"]
