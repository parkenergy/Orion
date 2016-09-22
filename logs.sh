#!/usr/bin/env bash

ssh ubuntu@54.187.66.137 "tail -f /home/ubuntu/orion.log" | bunyan
