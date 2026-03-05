FROM node:20-alpine
RUN addgroup -S shri && adduser -S shri -G shri
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY src/ ./src/
RUN chown -R shri:shri /app
USER shri
EXPOSE 5000
CMD ["node", "src/index.js"]
