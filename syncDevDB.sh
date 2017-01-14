#!/usr/bin/env bash

mongo localhost:27017/orion-dev --eval 'printjson(db.dropDatabase())'

ssh -f -o ExitOnForwardFailure=yes -L 27037:localhost:27017 access@54.187.140.31 sleep 900

mongo --eval 'printjson(db.copyDatabase("orion", "orion-dev", "localhost:27037"))'

killall ssh
