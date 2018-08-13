# gjør det mulig å bytte base-image slik at vi får bygd både innenfor og utenfor NAV
ARG BASE_IMAGE_PREFIX=""
FROM ${BASE_IMAGE_PREFIX}node as builder

ENV CI=true
ENV NODE_ENV=production
WORKDIR /app

EXPOSE 8991

COPY package*.json /app/
RUN npm ci
RUN npm run build

COPY /dist/. /app/dist/.
CMD ["npm", "start"]
