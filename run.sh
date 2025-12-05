#!/bin/sh
(trap 'kill 0' SIGINT; bash ./watch.sh & bash ./serve.sh & wait)
