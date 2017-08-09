#!/usr/bin/env bash

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Parameters missing"
  echo "Usage: $0 <lambda-function-name> <region>"
  exit -1
fi

cd "$( dirname "${BASH_SOURCE[0]}" )"
npm install
node index "$1" "$2"
