#!/bin/bash
set -e  # Exit on error

# Colors for better terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help
display_help() {
  echo -e "${BLUE}DASH5 Version Bumper${NC}"
  echo "Usage: $0 [options]"
  echo
  echo "Automatically bumps the semantic version based on the most recent git tag"
  echo
  echo "Options:"
  echo "  -h, --help       Display this help message"
  echo "  -M, --major      Bump major version (x.0.0)"
  echo "  -m, --minor      Bump minor version (0.x.0)"
  echo "  -p, --patch      Bump patch version (0.0.x) [default]"
  echo "  -d, --dry-run    Show what would be done without making changes"
  echo "  -f, --force      Force creating a tag even if it already exists (overwrites existing tag)"
  echo
  echo "Examples:"
  echo "  $0                 # Bumps patch version"
  echo "  $0 --minor         # Bumps minor version"
  echo "  $0 --major         # Bumps major version"
  echo "  $0 --patch --force # Forces patch version bump"
}

# Default values
BUMP_TYPE="patch"
DRY_RUN=false
FORCE=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -h|--help) display_help; exit 0 ;;
    -M|--major) BUMP_TYPE="major"; shift ;;
    -m|--minor) BUMP_TYPE="minor"; shift ;;
    -p|--patch) BUMP_TYPE="patch"; shift ;;
    -d|--dry-run) DRY_RUN=true; shift ;;
    -f|--force) FORCE=true; shift ;;
    *) echo -e "${RED}Unknown parameter: $1${NC}"; display_help; exit 1 ;;
  esac
done

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo -e "${RED}Error: git is not installed.${NC}"
  exit 1
fi

# Ensure that the local git repo is up to date
git fetch --tags --prune

# Get the latest version tag
LATEST_TAG=$(git tag -l "v*" | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1)

if [ -z "$LATEST_TAG" ]; then
  echo -e "${YELLOW}No existing version tags found. Starting from v0.1.0${NC}"
  MAJOR=0
  MINOR=1
  PATCH=0
else
  echo -e "${YELLOW}Latest version tag: ${LATEST_TAG}${NC}"
  
  # Extract version components
  VERSION=${LATEST_TAG#v}
  MAJOR=$(echo $VERSION | cut -d. -f1)
  MINOR=$(echo $VERSION | cut -d. -f2)
  PATCH=$(echo $VERSION | cut -d. -f3)
fi

# Bump version based on specified type
case $BUMP_TYPE in
  major)
    NEW_MAJOR=$((MAJOR + 1))
    NEW_MINOR=0
    NEW_PATCH=0
    echo -e "${YELLOW}Bumping major version: ${MAJOR}.${MINOR}.${PATCH} -> ${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}${NC}"
    ;;
  minor)
    NEW_MAJOR=$MAJOR
    NEW_MINOR=$((MINOR + 1))
    NEW_PATCH=0
    echo -e "${YELLOW}Bumping minor version: ${MAJOR}.${MINOR}.${PATCH} -> ${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}${NC}"
    ;;
  patch)
    NEW_MAJOR=$MAJOR
    NEW_MINOR=$MINOR
    NEW_PATCH=$((PATCH + 1))
    echo -e "${YELLOW}Bumping patch version: ${MAJOR}.${MINOR}.${PATCH} -> ${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}${NC}"
    ;;
esac

NEW_VERSION="v${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}"

# Check if the tag already exists
if git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
  if [ "$FORCE" = true ]; then
    echo -e "${YELLOW}Warning: Tag ${NEW_VERSION} already exists. --force option specified, will overwrite.${NC}"
  else
    echo -e "${RED}Error: Tag ${NEW_VERSION} already exists. Use --force to overwrite.${NC}"
    exit 1
  fi
fi

# Execute the version bump
if [ "$DRY_RUN" = true ]; then
  echo -e "${BLUE}Dry run: Would create tag ${NEW_VERSION}${NC}"
else
  # Create and push the new tag
  if [ "$FORCE" = true ] && git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
    echo -e "${YELLOW}Deleting existing tag ${NEW_VERSION}...${NC}"
    git tag -d "$NEW_VERSION"
    git push origin --delete "$NEW_VERSION" 2>/dev/null || true
  fi
  
  echo -e "${YELLOW}Creating new tag ${NEW_VERSION}...${NC}"
  git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
  
  echo -e "${YELLOW}Pushing new tag to origin...${NC}"
  git push origin "$NEW_VERSION"
  
  echo -e "${GREEN}✅ Successfully created and pushed tag ${NEW_VERSION}${NC}"
  echo -e "${YELLOW}To create a release, go to:${NC}"
  echo -e "${BLUE}https://github.com/$(git config --get remote.origin.url | sed -E 's|.*github.com[:/]([^/]+/[^/]+).*|\1|' | sed 's/\.git$//')/releases/new?tag=${NEW_VERSION}${NC}"
fi

echo
echo -e "${YELLOW}To trigger a release workflow, run:${NC}"
echo -e "${BLUE}gh workflow run release.yml --ref ${NEW_VERSION}${NC}"