#!/bin/bash

if [ -d "www" ]; then
  echo Directory www/ already exists. Nothing to do.
  exit 0
fi

mkdir www
cp -r resources/www/* www/
