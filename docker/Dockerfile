# Use the official Nginx Alpine image
FROM nginx:alpine

# Define build argument for environment (defaults to staging)
ARG ENVIRONMENT=staging

# Set environment label
LABEL environment=${ENVIRONMENT}

# Copy the static files from the Next.js build
COPY apps/lrauv-dash2/out /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create environment indicator file that can be used for health checks or debugging
RUN echo "DASH5 ${ENVIRONMENT} environment" > /usr/share/nginx/html/env.txt

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]