#!/usr/bin/env bash

ssh -f -o ExitOnForwardFailure=yes -L 27037:localhost:27017 access@54.187.140.31 sleep 900

mongo --eval 'db.copyDatabase("orion", "orion-dev", "localhost:27037")'
