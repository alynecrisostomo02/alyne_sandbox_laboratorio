#!/bin/bash
echo "Testing build..."
corepack pnpm run build
echo "Testing catalog..."
corepack pnpm run verify
