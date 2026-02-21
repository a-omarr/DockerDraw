export const EXAMPLE_COMPOSE = `
services:
  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: \${MYSQL_DATABASE:-foodsaver}
      MYSQL_USER: \${MYSQL_USER:-appuser}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD:-apppassword}
    ports:
      - "3307:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
    environment:
      PORT: \${PORT:-3001}
      MYSQL_HOST: db
      MYSQL_PORT: 3306
      MYSQL_USER: \${MYSQL_USER:-appuser}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD:-apppassword}
      MYSQL_DATABASE: \${MYSQL_DATABASE:-foodsaver}
      NODE_ENV: production
      CORS_ORIGIN: \${CORS_ORIGIN:-http://localhost:8080}
      FRONTEND_BASE_URL: \${FRONTEND_BASE_URL:-http://localhost:8080}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3002:3001"
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
    ports:
      - "8080:8080"
    depends_on:
      - backend

volumes:
  db_data:
`;
