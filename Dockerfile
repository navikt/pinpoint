FROM docker.adeo.no:5000/pus/node as node-builder

ENV CI=true
WORKDIR /app

EXPOSE 8991

COPY package*.json /app/
RUN npm install

COPY /src/. /app/src/.
CMD ["npm", "start"]
