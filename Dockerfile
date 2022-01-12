FROM node:13-alpine

RUN apt-get update && apt-get upgrade -y \
    && apt-get clean

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password

RUN mkdir -p /home/app

COPY . /home/app

WORKDIR /home/app

RUN npm install

CMD ["node", "server.js"]
