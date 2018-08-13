# gjør det mulig å bytte base-image slik at vi får bygd både innenfor og utenfor NAV
ARG BASE_IMAGE_PREFIX=""
FROM ${BASE_IMAGE_PREFIX}node as builder

ENV CI=true

EXPOSE 8991
WORKDIR /app

COPY . /app/.
RUN npm ci

ENV NODE_ENV=production
RUN npm run build

COPY /dist/. /app/dist/.
CMD ["npm", "start"]
