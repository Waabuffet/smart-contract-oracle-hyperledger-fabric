#!/bin/bash

#? exporting org1 variables
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

#? deploying oracle and contract
./network.sh deployCC -ccn property-transfer -ccp ./dom-app/app -ccl javascript
./network.sh deployCC -ccn tax-oracle -ccp ./dom-app/oracle -ccl javascript
./network.sh deployCC -ccn tax-oracle-encrypted -ccp ./dom-app/oracleEncrypted -ccl javascript
./network.sh deployCC -ccn decryptor -ccp ./dom-app/decryptor -ccl javascript

#? initialize ledger with some data
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"InitLedger","Args":[]}'

#? initialize ledger of oracles
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n tax-oracle --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"InitLedger","Args":[]}'

# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n tax-oracle-encrypted --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"InitLedger","Args":[]}'

#? wait till data is present
# sleep 5

#? check that ledger data exist
# peer chaincode query -C mychannel -n property-transfer -c '{"Args":["GetAllProperties"]}'
# peer chaincode query -C mychannel -n tax-oracle -c '{"Args":["GetAllOracles"]}'
# peer chaincode query -C mychannel -n tax-oracle-encrypted -c '{"Args":["GetAllOracles"]}'

#? update contract (not working yet)
# ./network.sh deployCC -ccn dom-contract -ccp ./dom-app/app -ccl javascript -ccv 1.1
#* when passing -ccv which is the version of the chaincode, it sais a chaincode already exists with a different version
#* when not passing it, it sais a chaincode already exists with the same name

#? query contract (read)
# peer chaincode query -C mychannel -n tax-oracle -c '{"Args":["CallFinanceTaxDepartment", "JVNKL"]}'
# peer chaincode query -C mychannel -n property-transfer -c '{"Args":["GetAllProperties"]}'

#? invoke contract (write)
#* failing scneario (because tax not paid)
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"TransferProperty","Args":["property1","JVNKL"]}'

#* successing scnearios:
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"TransferProperty","Args":["property6","SWT83"]}'

#? other contract functions with params:
#* - InitLedger() :: write
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"InitLedger","Args":[]}'

#* - CreateProperty(id, lattitude, longitude, owner, purchase_date) :: write
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"CreateProperty","Args":["property7", "33.898290", "-49.045891", "82V4W", "2022-05-20 11:30:00"]}'

#* - GetOwnerTaxPayments(owner) :: read
# peer chaincode query -C mychannel -n property-transfer -c '{"Args":["GetOwnerTaxPayments","82V4W"]}'


#* tax oracle encrypted
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n tax-oracle-encrypted --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"CallFinanceTaxDepartment","Args":["82V4W"]}'

#* - ReadProperty(id) :: read
# peer chaincode query -C mychannel -n property-transfer -c '{"Args":["ReadProperty","property6"]}'

#* - UpdateProperty(id, lattitude, longitude, purchase_date) :: write
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"UpdateProperty","Args":["property7", "33.898290", "-49.045891", "2022-05-20 11:30:00"]}'

#* - DeleteProperty(id) :: write
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"DeleteProperty","Args":["property6"]}'

#* - PropertyExists(id) :: write
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"PropertyExists","Args":["property5"]}'

#* - TransferProperty(id, newowner) :: write
# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile \
# "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
# -C mychannel -n property-transfer --peerAddresses localhost:7051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
# --peerAddresses localhost:9051 --tlsRootCertFiles \
# "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
# -c '{"function":"TransferProperty","Args":["property5", "82V4W"]}'

#* - GetAllProperties() :: read
# peer chaincode query -C mychannel -n property-transfer -c '{"Args":["GetAllProperties"]}'