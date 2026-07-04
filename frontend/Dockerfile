# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from:build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration if needed, otherwise use default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
