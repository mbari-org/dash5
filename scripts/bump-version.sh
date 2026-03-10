#!/usr/bin/env bash
set -euo pipefail

# Colors for better terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

display_help() {
  echo -e "${BLUE}DASH5 Version Bumper${NC}"
  echo "Usage: $0 [options]"
  echo
  echo "Automatically bumps the semantic version based on the most recent git tag."
  echo
  echo "Branch rules:"
  echo "  develop  Creates a staging release tag. CI publishes :staging and :staging-X.Y.Z."
  echo "  main     Creates a production release tag. CI publishes :production."
  echo "           Production does not auto-update; release managers deploy it intentionally."
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
  echo "  $0                 # Bumps patch version from develop or main"
  echo "  $0 --minor         # Bumps minor version"
  echo "  $0 --major         # Bumps major version"
  echo "  $0 --patch --force # Forces patch version bump"
}

log_info() {
  echo -e "${YELLOW}$1${NC}"
}

log_note() {
  echo -e "${BLUE}$1${NC}"
}

fail() {
  echo -e "${RED}Error: $1${NC}" >&2
  exit 1
}

tag_exists() {
  git show-ref --tags --verify --quiet "refs/tags/$1"
}

latest_version_tag() {
  git tag -l 'v*' | awk '/^v[0-9]+\.[0-9]+\.[0-9]+$/ { print }' | sort -V | tail -n 1
}

print_release_guidance() {
  local environment="$1"
  local version="$2"

  echo
  log_info "CI will publish:"
  echo -e "${BLUE}mbari/lrauv-dash-5:${environment}${NC}"

  if [ "$environment" = "staging" ]; then
    echo -e "${BLUE}mbari/lrauv-dash-5:${environment}-${version}${NC}"
  fi

  if [ "$environment" = "staging" ]; then
    log_info "Staging should update automatically when Watchtower sees the new :staging image."
  else
    log_info "Production will not auto-update. Pull and recreate the production container intentionally."
  fi
}

# Default values
BUMP_TYPE="patch"
DRY_RUN=false
FORCE=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    -h|--help) display_help; exit 0 ;;
    -M|--major) BUMP_TYPE="major"; shift ;;
    -m|--minor) BUMP_TYPE="minor"; shift ;;
    -p|--patch) BUMP_TYPE="patch"; shift ;;
    -d|--dry-run) DRY_RUN=true; shift ;;
    -f|--force) FORCE=true; shift ;;
    *) fail "Unknown parameter: $1" ;;
  esac
done

if ! command -v git >/dev/null 2>&1; then
  fail "git is not installed."
fi

git fetch origin main develop --tags --prune

CURRENT_BRANCH=$(git symbolic-ref --quiet --short HEAD || true)
if [ -z "$CURRENT_BRANCH" ]; then
  fail "Detached HEAD detected. Check out develop or main before bumping a version."
fi

case "$CURRENT_BRANCH" in
  develop)
    TARGET_ENVIRONMENT="staging"
    TAG_MESSAGE_PREFIX="Staging release"
    ;;
  main)
    TARGET_ENVIRONMENT="production"
    TAG_MESSAGE_PREFIX="Production release"
    ;;
  *)
    fail "Version bumps are only supported from develop (staging) or main (production). Current branch: ${CURRENT_BRANCH}"
    ;;
esac

REMOTE_BRANCH="origin/${CURRENT_BRANCH}"
if ! git show-ref --verify --quiet "refs/remotes/${REMOTE_BRANCH}"; then
  fail "Remote branch ${REMOTE_BRANCH} was not found. Fetch the branch and try again."
fi

LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git rev-parse "$REMOTE_BRANCH")

if [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
  if git merge-base --is-ancestor "$LOCAL_SHA" "$REMOTE_SHA"; then
    fail "Local ${CURRENT_BRANCH} is behind ${REMOTE_BRANCH}. Run: git checkout ${CURRENT_BRANCH} && git pull origin ${CURRENT_BRANCH}"
  elif git merge-base --is-ancestor "$REMOTE_SHA" "$LOCAL_SHA"; then
    fail "Local ${CURRENT_BRANCH} has commits that are not on ${REMOTE_BRANCH}. Push or merge them before tagging a release."
  else
    fail "Local ${CURRENT_BRANCH} has diverged from ${REMOTE_BRANCH}. Sync the branch before tagging a release."
  fi
fi

LATEST_TAG=$(latest_version_tag)

if [ -n "$LATEST_TAG" ] && [ "$CURRENT_BRANCH" = "main" ]; then
  LATEST_TAG_SHA=$(git rev-list -n 1 "$LATEST_TAG")
  if ! git merge-base --is-ancestor "$LATEST_TAG_SHA" HEAD; then
    fail "main does not contain ${LATEST_TAG}. Merge develop into main before creating a production release."
  fi
fi

if [ -z "$LATEST_TAG" ]; then
  log_info "No existing version tags found. Starting from v0.1.0"
  MAJOR=0
  MINOR=1
  PATCH=0
else
  log_info "Latest version tag: ${LATEST_TAG}"
  VERSION=${LATEST_TAG#v}
  MAJOR=$(echo "$VERSION" | cut -d. -f1)
  MINOR=$(echo "$VERSION" | cut -d. -f2)
  PATCH=$(echo "$VERSION" | cut -d. -f3)
fi

case "$BUMP_TYPE" in
  major)
    NEW_MAJOR=$((MAJOR + 1))
    NEW_MINOR=0
    NEW_PATCH=0
    log_info "Bumping major version for ${TARGET_ENVIRONMENT}: ${MAJOR}.${MINOR}.${PATCH} -> ${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}"
    ;;
  minor)
    NEW_MAJOR=$MAJOR
    NEW_MINOR=$((MINOR + 1))
    NEW_PATCH=0
    log_info "Bumping minor version for ${TARGET_ENVIRONMENT}: ${MAJOR}.${MINOR}.${PATCH} -> ${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}"
    ;;
  patch)
    NEW_MAJOR=$MAJOR
    NEW_MINOR=$MINOR
    NEW_PATCH=$((PATCH + 1))
    log_info "Bumping patch version for ${TARGET_ENVIRONMENT}: ${MAJOR}.${MINOR}.${PATCH} -> ${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}"
    ;;
  *)
    fail "Unsupported bump type: ${BUMP_TYPE}"
    ;;
esac

NEW_VERSION="v${NEW_MAJOR}.${NEW_MINOR}.${NEW_PATCH}"
DOCKER_VERSION="${NEW_VERSION#v}"
TAG_MESSAGE="${TAG_MESSAGE_PREFIX} ${NEW_VERSION}"

if tag_exists "$NEW_VERSION"; then
  if [ "$FORCE" = true ]; then
    log_info "Warning: Tag ${NEW_VERSION} already exists. --force specified, so it will be replaced."
  else
    fail "Tag ${NEW_VERSION} already exists. Use --force to overwrite it."
  fi
fi

log_note "Release target: ${TARGET_ENVIRONMENT} (branch ${CURRENT_BRANCH})"
log_note "Tag annotation: ${TAG_MESSAGE}"

if [ "$DRY_RUN" = true ]; then
  log_note "Dry run: Would create tag ${NEW_VERSION}"
  print_release_guidance "$TARGET_ENVIRONMENT" "$DOCKER_VERSION"
  exit 0
fi

if [ "$FORCE" = true ] && tag_exists "$NEW_VERSION"; then
  log_info "Deleting existing tag ${NEW_VERSION}..."
  git tag -d "$NEW_VERSION"
  git push origin --delete "$NEW_VERSION" 2>/dev/null || true
fi

log_info "Creating new tag ${NEW_VERSION}..."
git tag -a "$NEW_VERSION" -m "$TAG_MESSAGE"

log_info "Pushing new tag to origin..."
git push origin "$NEW_VERSION"

echo -e "${GREEN}Successfully created and pushed tag ${NEW_VERSION}${NC}"
print_release_guidance "$TARGET_ENVIRONMENT" "$DOCKER_VERSION"
