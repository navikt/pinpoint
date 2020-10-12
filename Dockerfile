FROM node:14

ENV CI=true

EXPOSE 8991
WORKDIR /app

COPY . /app/.
RUN npm ci

ENV NODE_ENV=production
RUN npm run build

CMD ["npm", "start"]
