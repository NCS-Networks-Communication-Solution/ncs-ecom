#!/bin/bash

echo "Listing all node binaries in PATH, with version and path:"

# get all node paths
IFS=$'\n'
for p in $(which -a node); do
  echo "----"
  echo "Path: $p"
  "$p" -v 2>&1 || echo "(cannot run version command)"
done

echo "----"
echo "Also search common system locations for node binaries"

# search in typical folders
for dir in /usr/local/bin /usr/bin /opt/homebrew/bin /usr/local/sbin /usr/sbin; do
  if [ -x "$dir/node" ]; then
    echo "Found node at $dir/node"
    "$dir/node" -v 2>&1
  fi
done
