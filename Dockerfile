FROM node:16.16-bullseye

WORKDIR /app

COPY . .

RUN npm install --production

EXPOSE 8080

CMD ["npm", "start"]