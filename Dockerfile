FROM node:24-alpine

WORKDIR /app

RUN mkdir -p /app/backend /app/frontend /app/db /app/backend/uploads

RUN apk update && apk add --no-cache python3 make g++

COPY backend/package.json /app/backend/
COPY frontend/package.json /app/frontend/

RUN cd /app/backend && npm install --registry=https://registry.npmmirror.com
RUN cd /app/frontend && npm install --registry=https://registry.npmmirror.com

COPY backend /app/backend
COPY frontend /app/frontend

RUN cd /app/frontend && npm run build

EXPOSE 3001

CMD ["node", "/app/backend/server.js"]
