FROM node:22-bookworm
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npx playwright install --with-deps chromium
COPY . .
ENV NODE_ENV=production
CMD ["sh", "scripts/render-entrypoint.sh"]
