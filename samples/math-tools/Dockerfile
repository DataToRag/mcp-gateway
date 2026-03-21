FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "index.js"]
