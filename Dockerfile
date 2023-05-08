FROM node:18.16-bullseye

WORKDIR /app

COPY package*.json LICENSE ./

COPY src ./src/

RUN npm ci --ignore-script --omit dev

CMD ["npm", "start"]