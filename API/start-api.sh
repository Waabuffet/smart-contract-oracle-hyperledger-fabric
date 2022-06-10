#!/bin/bash

docker run --rm -d \
-v $(pwd)/api.php:/var/www/html/didOwnerPayTax.php \
-p 8080:80 \
--name php-api php:apache

#* test from terminal
# GET curl http://localhost:8080/didOwnerPayTax.php?user_id=IBRCL&encrypted=0

#* stop API server
# docker stop php-api
