ARG BASE_IMAGE_PREFIX=""
FROM ${BASE_IMAGE_PREFIX}node as builder

ENV CI=true
WORKDIR /app

EXPOSE 8991

COPY package*.json /app/
RUN npm ci

COPY /src/. /app/src/.
CMD ["npm", "start"]
