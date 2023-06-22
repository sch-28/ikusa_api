FROM node:18-slim
RUN apt-get update && apt-get install -y openssl
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build
RUN mkdir logs
EXPOSE 3000
USER node
CMD ["node", "build"]