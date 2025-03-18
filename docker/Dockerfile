# Use the official Nginx Alpine image
FROM nginx:alpine

# Copy the static files from the Next.js build
COPY apps/lrauv-dash2/out /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]