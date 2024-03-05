FROM node:16.14-alpine
ENV NODE_ENV=production
WORKDIR /valuationary/backend
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production
COPY . .
CMD ["npm", "start"]
