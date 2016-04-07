#!/bin/bash
heroku logs --app parkenergy-orion-production --tail | awk '{$1=$2=""; gsub(/^[ ]+/,"", $0); print $0; system("") }' | bunyan --level info
