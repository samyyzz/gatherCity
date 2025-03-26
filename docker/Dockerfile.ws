FROM node:18-alpine

WORKDIR /usr/app/gathercity

COPY ./package*.json ./
COPY ./turbo.json ./
COPY ./packages ./packages
COPY ./apps/ws ./gathercity/ws

RUN npm install
RUN npm run db:generate
RUN npm run build

EXPOSE 8080

CMD [ "npm", "start:ws" ]