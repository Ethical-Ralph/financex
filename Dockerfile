# Build Stage
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Install Yarn
RUN npm install -g yarn

COPY . .

RUN yarn install
RUN yarn run build

# Production Stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

CMD ["yarn", "run", "start:prod"]
