#!/bin/bash
set -e  # Exit on error

# Colors for better terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up environment variables...${NC}"
# Navigate to the repository root
cd "$(dirname "$0")/.."

# Set environment variables for the build
export NEXT_PUBLIC_API_HOST=http://localhost:3002
export NEXT_PUBLIC_BASE_URL=http://localhost:3002/TethysDash/api
export NEXT_PUBLIC_ODSS2BASE_URL=http://localhost:3002/odss2dash/api
export NEXT_PUBLIC_WEBSOCKET_URL=wss://okeanids.mbari.org/ws/

# Check if Google Maps API key is provided as an argument
if [ -n "$1" ]; then
  export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$1"
else
  echo -e "${YELLOW}Warning: No Google Maps API key provided. Using placeholder value.${NC}"
  echo -e "${YELLOW}To provide a key, run: ./docker/build-static.sh YOUR_API_KEY${NC}"
  export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="placeholder-api-key"
fi

echo -e "${YELLOW}Building Next.js static export with environment variables:${NC}"
echo -e "NEXT_PUBLIC_API_HOST: ${NEXT_PUBLIC_API_HOST}"
echo -e "NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}"
echo -e "NEXT_PUBLIC_ODSS2BASE_URL: ${NEXT_PUBLIC_ODSS2BASE_URL}"
echo -e "NEXT_PUBLIC_WEBSOCKET_URL: ${NEXT_PUBLIC_WEBSOCKET_URL}"
echo -e "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}"

# Run the build with environment variables
yarn workspace @mbari/lrauv-dash2 build

echo -e "${YELLOW}Building Docker image with static files...${NC}"
docker build -t mbari/lrauv-dash:static -f docker/Dockerfile.static .

echo -e "${GREEN}✓ Build completed successfully!${NC}"
echo -e "To run the container, use: ${YELLOW}docker run -p 8080:80 mbari/lrauv-dash:static${NC}"
echo -e "Then open ${YELLOW}http://localhost:8080${NC} in your browser."
echo
echo -e "${YELLOW}Note: This build includes environment variables for a local development setup.${NC}"
echo -e "${YELLOW}For production deployments, adjust the environment variables in this script.${NC}"
echo -e "${YELLOW}You provided Google Maps API Key: ${GREEN}${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}${NC}"