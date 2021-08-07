FROM node:16.6-buster

WORKDIR /app

COPY . .

RUN npm install --production

EXPOSE 8080

CMD ["npm", "start"]