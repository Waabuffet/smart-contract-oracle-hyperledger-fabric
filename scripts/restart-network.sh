#!/bin/bash

#? stopping logging container
docker stop logspout
docker rm logspout

#? bring network down
./network.sh down

# docker network prune 

#? bring network up and create channel with name 'mychannel' (default)
./network.sh up createChannel -ca

./deploy-oracle-contract.sh

#? checking logs coming from console log inside the contract
# docker logs $(docker ps | grep dev-peer0.org1.example.com-property-transfer_1.0 | awk '{print $1}')