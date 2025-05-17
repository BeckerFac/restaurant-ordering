# Usar una imagen oficial de Node.js recomendada para Next.js 14
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar el cache de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Build de la app (genera los estilos de Tailwind y el build de Next.js)
RUN npm run build

# Exponer el puerto por defecto de Next.js
EXPOSE 3000

# Comando para iniciar la app en producción
CMD ["npm", "run", "start"] 