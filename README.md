# Dominique Memoire

# Components:
- API
- Blockchain
   - Oracle
   - Smart Contract
- Client Application

# API
## Startup
Go to the `API` directory and start the docker container using the followinng commands:
```
cd ./API
docker run --rm -d -v ./api.php:/var/www/html/didOwnerPayTax.php -p 8080:80 --name php-api php:apache
```

## Users present in tax API

| User ID   | Name      | Has Paid Tax  |
| --------- | --------- | ------------- |
| IBRCL     | Carl      | true          |
| JVNKL     | John      | false         |
| 82V4W     | Elie      | true          |
| PQ2HA     | Joseph    | true          |
| IBYXI     | Alex      | false         |
| IRXQD     | Naomi     | true          |
| DZFKS     | Jennifer  | false         |
| 1EE5Y     | Alexa     | false         |
| WBE0D     | Caroline  | true          |
| SWT83     | Levi      | true          |

# Blockchain

## Startup
To start the blockchain, we need to move to the `test-network` directory, start the network and create a channel:
```
cd /fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
```

## Deploy the Oracle
Go to the `oracle` directory to install dependencies:
```
cd <PROJECT_PATH>/oracle
npm install
```

Go back to the `test-network` directory, replace the `PROJECT_PATH` variable in the command bellow before executing:
```
cd /fabric-samples/test-network

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

./network.sh deployCC -ccn tax-oracle -ccp <PROJECT_PATH>/oracle -ccl javascript
```

## Deploy the Smart Contract
Same steps as the `oracle` deployment:
```
cd <PROJECT_PATH>/app
npm install

cd /fabric-samples/test-network

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

./network.sh deployCC -ccn property-transfer -ccp <PROJECT_PATH>/app -ccl javascript
```

# Client Application
Go to the `client-app` directory and execute the following to install dependencies and start the client server:
```
cd <PROJECT_PATH>/client-app
npm install
node app.js
```