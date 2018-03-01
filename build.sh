NODE_ENV=production yarn build
docker build -t futurice/personal-dashboard-ui:$(git rev-parse --short HEAD) .