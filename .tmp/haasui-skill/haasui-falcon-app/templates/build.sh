#!/usr/bin/env bash
# Copy to tools/build.sh. Select a target profile explicitly; never pick the
# first toolchain or binary found on disk.
set -euo pipefail

ROOT="${PROJECT_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

: "${TARGET_PROFILE_ID:?Set TARGET_PROFILE_ID from the probed Youdao device profile}"
: "${CROSS_TOOLCHAIN_PREFIX:?Set CROSS_TOOLCHAIN_PREFIX for that exact ABI/libc}"
: "${TARGET_LIB_DIR:?Set TARGET_LIB_DIR, for example ui/libs/arm64-<sku>}"
: "${PLUGIN_NAME:?Set PLUGIN_NAME without the libjsapi_ prefix}"

UI_DIR="${UI_DIR:-.}"
NATIVE_DIR="${NATIVE_DIR:-jsapi}"
BUILD_DIR="${BUILD_DIR:-$NATIVE_DIR/build/$TARGET_PROFILE_ID}"
DIST_DIR="${DIST_DIR:-dist/$TARGET_PROFILE_ID}"
PACKAGE_SCRIPT="${PACKAGE_SCRIPT:-build:prod}"

cmake -S "$NATIVE_DIR" -B "$BUILD_DIR" -DCMAKE_BUILD_TYPE=Release
cmake --build "$BUILD_DIR" --parallel

SO="$BUILD_DIR/libjsapi_${PLUGIN_NAME}.so"
test -f "$SO"
file "$SO"
readelf -h "$SO"
nm -D "$SO" | grep custom_init_jsapis

mkdir -p "$TARGET_LIB_DIR" "$DIST_DIR"
cp "$SO" "$TARGET_LIB_DIR/"

npm --prefix "$UI_DIR" run "$PACKAGE_SCRIPT"
APPID="$(node -p "require('./$UI_DIR/package.json').appid")"
AMR="$UI_DIR/$APPID.amr"
test -f "$AMR"
cp "$AMR" "$DIST_DIR/$APPID.amr"

echo "Built profile=$TARGET_PROFILE_ID so=$SO amr=$DIST_DIR/$APPID.amr"
