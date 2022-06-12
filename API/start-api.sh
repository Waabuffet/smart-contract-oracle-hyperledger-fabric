#!/bin/bash

docker run --rm -d \
-v $(pwd)/api.php:/var/www/html/didOwnerPayTax.php \
-p 8080:80 \
--name php-api php:apache

#* test from terminal
# GET curl http://localhost:8080/didOwnerPayTax.php?encrypted=0&user_id=IBRCL

#* stop API server
# docker stop php-api
