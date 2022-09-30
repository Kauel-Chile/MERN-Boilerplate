FROM node:14-alpine as buildjob_client
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:14-alpine as buildjob_server
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

FROM node:14-alpine as buildjob_final
WORKDIR /app
COPY --from=buildjob_client /app/build ./client/build
COPY --from=buildjob_server /app/dist ./server/dist
COPY --from=buildjob_server /app/package*.json ./server
RUN npm install dotenv --prefix ./server
CMD ["npm", "run", "start", "--prefix", "server"]
