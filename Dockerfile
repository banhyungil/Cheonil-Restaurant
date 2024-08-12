# 1단계: 빌드 단계
FROM node:20-alpine AS build

WORKDIR /app

COPY ./ ./
RUN npm install
RUN npm run build

# 2단계: 실행 단계
FROM nginx:alpine

COPY ./default.conf.template /etc/nginx/templates/default.conf.template

# 빌드된 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

ENV API_IP=localhost
ENV API_PORT=8000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]