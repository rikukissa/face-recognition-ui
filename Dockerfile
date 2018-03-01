FROM nginx
COPY build /usr/share/nginx/html
COPY nginx.template /etc/nginx/conf.d/nginx.template

EXPOSE 8080

CMD /bin/bash -c "envsubst '${API_URL}' < /etc/nginx/conf.d/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"