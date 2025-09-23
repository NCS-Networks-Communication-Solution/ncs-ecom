#!/bin/bash

echo "Interactive shell 'node' & path:"
echo "which node: $(which node)"
echo "node -v: $(node -v)"

echo ""
echo "npm & npm exec node version:"
echo "which npm: $(which npm)"
echo "npm -v: $(npm -v)"
echo "npm exec node -v: $(npm exec node -v 2>&1 || echo 'error')"

echo ""
echo "npm script context check:"
if grep -q "\"checknode\"" package.json; then
  npm run checknode
else
  echo "No 'checknode' script in package.json"
fi
