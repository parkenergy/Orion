#!/bin/bash
heroku logs --app parkenergy-orion-production --tail | bunyan
