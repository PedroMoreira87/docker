FROM node:latest

WORKDIR /app

COPY package.json .

#RUN npm install --only=production
# Install dependencies based on NODE_ENV
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . .

ENV PORT 3000

EXPOSE $PORT

CMD ["node", "index.js"]
#CMD ["npm", "run", "dev"]
