FROM node:20.9.0-bookworm

WORKDIR /app

COPY package*.json LICENSE ./

COPY src ./src/

RUN npm ci --ignore-script --omit dev

CMD ["npm", "start"]