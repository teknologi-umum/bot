FROM node:22.5.1-bookworm

WORKDIR /app

COPY package*.json LICENSE ./

COPY src ./src/

RUN npm ci --ignore-script --omit dev

CMD ["npm", "start"]