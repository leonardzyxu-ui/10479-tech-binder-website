#!/bin/sh
set -eu

SOURCE_GLB="${SOURCE_GLB:-/Users/leoxu/Desktop/10479-0601-glb.glb}"
OUTPUT_GLB="${OUTPUT_GLB:-binder_assets/10479/3d/nexus-web.glb}"

mkdir -p "$(dirname "$OUTPUT_GLB")"
npx --yes gltfpack@1.2.0 \
  -i "$SOURCE_GLB" \
  -o "$OUTPUT_GLB" \
  -c -si 0.10 -sa -sp -mm -v
