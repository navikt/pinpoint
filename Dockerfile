#FROM docker.adeo.no:5000/pus/node as node-builder

#ENV CI=true
#WORKDIR /app

#EXPOSE 8080

#COPY package*.json /app/
#COPY index.js /app/
#COPY /tekster/. /app/tekster/.

#RUN npm install
#CMD ["node", "index.js"]
