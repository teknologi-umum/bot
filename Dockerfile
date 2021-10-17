FROM node:16.11-buster

WORKDIR /app

COPY . .

RUN npm install --production

EXPOSE 8080

CMD ["npm", "start"]