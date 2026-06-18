FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/* \
	&& chown node:node /app

COPY --chown=node:node package.json package-lock.json ./

USER node

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .

EXPOSE 8089

CMD ["node", "serve.js"]
