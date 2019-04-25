FROM node:lts-alpine
ENV NODE_ENV=production
ARG REGISTRY="https://registry.npmjs.org"
RUN npm set registry ${REGISTRY}
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node . .
USER node
RUN npm ci --production --no-cache
CMD npm start
