FROM nginx
COPY build /usr/share/nginx/html
COPY nginx.template /etc/nginx/conf.d/nginx.template

EXPOSE 8000

CMD envsubst '${API_URL}' < /etc/nginx/conf.d/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'