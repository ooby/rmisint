FROM node:lts-alpine
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node . .
USER node
RUN yarn install --pure-lockfile --prod
CMD yarn start
