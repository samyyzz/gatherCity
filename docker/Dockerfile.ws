FROM node:20-alpine

WORKDIR /usr/app/gathercity

COPY ./package*.json ./
COPY ./turbo.json ./
COPY ./apps/ws ./apps/ws
COPY ./packages ./packages

RUN npm install
RUN npm run db:generate
RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start:ws" ]