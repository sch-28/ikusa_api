FROM node:18-slim
RUN apt-get update && apt-get install -y openssl
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build
RUN mkdir -p logs
EXPOSE 3000
USER node
CMD ["node", "build"]