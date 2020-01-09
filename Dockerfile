FROM node

ENV CI=true

EXPOSE 8991
WORKDIR /app

COPY . /app/.
RUN npm ci

ENV NODE_ENV=production
RUN npm run build

COPY /dist/. /app/dist/.
CMD ["npm", "start"]
