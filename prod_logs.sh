#!/bin/bash
heroku logs --app parkenergy-orion-production --tail | sed -l 's/.*app\[web\..*\]\: //' | bunyan
