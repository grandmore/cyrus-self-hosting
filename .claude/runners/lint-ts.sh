#!/bin/bash
set -e

DIR=$1
shift

cd "$DIR" && yarn lint "$@"
