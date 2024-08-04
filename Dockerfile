# 1단계: 빌드 단계
FROM node AS build

WORKDIR /app

COPY ./ ./
RUN npm install
RUN npm run build

# 2단계: 실행 단계
FROM nginx:alpine

COPY ./nginx.conf.template /etc/nginx/templates

# 빌드된 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]