FROM node:18.16.0-alpine3.17
LABEL "com.cba.image.authors"="engineeringteam@company.com"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]