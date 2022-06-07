'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./assets/util/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('./assets/util/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'property-transfer';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const port = 8081;
let contract;
let gateway;

app.use(express.static(path.join(__dirname, '/assets')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.post('/initLedger', async (req, res) => {
	console.log('Initializing ledger with properties');

	try {
		let result = null; //await contract.submitTransaction('InitLedger');
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.post('/createProperty', async (req, res) => {
	console.log('Creating new property');
	let id = req.body.ID;
	let latitude = req.body.latitude;
	let longitude = req.body.longitude;
	let owner = req.body.owner;
	let purchase_date = req.body.purchase_date;
	try {
		let result = await contract.submitTransaction('CreateProperty', id, latitude, longitude, owner, purchase_date);
		// if (`${result}` !== '') {
		// 	console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		// }
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.get('/getProperty', async (req, res) => {
	console.log('Getting property');
	let id = req.query.id;
	try {
		let result = await contract.evaluateTransaction('ReadProperty', id);
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.get('/propertyExists', async (req, res) => {
	console.log('Checking if property exists');
	let id = req.query.id;
	try {
		let result = await contract.evaluateTransaction('PropertyExists', id);
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.post('/updateProperty', async (req, res) => {
	console.log('Updating property');
	let id = req.body.ID;
	let latitude = req.body.latitude;
	let longitude = req.body.longitude;
	let owner = req.body.owner;
	let purchase_date = req.body.purchase_date;
	try {
		let result = await contract.submitTransaction('UpdateProperty', id, latitude, longitude, owner, purchase_date);
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.post('/deleteProperty', async (req, res) => {
	console.log('Deleting property');
	let id = req.body.ID;
	try {
		let result = await contract.submitTransaction('DeleteProperty', id);
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.post('/changePropertyOwner', async (req, res) => {
	console.log('Changing property owner');
	let id = req.body.ID;
	let newowner = req.body.newowner;
	try {
		let result = await contract.submitTransaction('TransferProperty', id, newowner);
		res.json({
			status: 200,
			message: result
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.get('/getAllProperties', async (req, res) => {
	console.log('Getting all properties');

	try {
		let result = await contract.evaluateTransaction('GetAllProperties');
		let resultString = result.toString();
		//* for testing
		// let result = [
		// 	{
        //         ID: 'property1',
        //         latitude: '33.898290',
        //         longitude: '35.643253',
        //         owner: 'IBRCL',
        //         purchase_date: '2020-01-02 14:20:00'
        //     },
        //     {
        //         ID: 'property2',
        //         latitude: '32.240480', 
        //         longitude: '42.436585',
        //         owner: 'JVNKL',
        //         purchase_date: '2020-01-02 14:20:00'
        //     },
        //     {
        //         ID: 'property3',
        //         latitude: '39.987305',
        //         longitude: '34.808560',
        //         owner: '82V4W',
        //         purchase_date: '2020-01-02 14:20:00'
        //     },
        //     {
        //         ID: 'property4',
        //         latitude: '57.191616',
        //         longitude: '104.941213',
        //         owner: 'IBYXI',
        //         purchase_date: '2020-01-02 14:20:00'
        //     },
        //     {
        //         ID: 'property5',
        //         latitude: '-7.845575',
        //         longitude: '-49.045891',
        //         owner: 'IRXQD',
        //         purchase_date: '2020-01-02 14:20:00'
        //     },
        //     {
        //         ID: 'property6',
        //         latitude: '-25.921426',
        //         longitude: '24.778973',
        //         owner: 'DZFKS',
        //         purchase_date: '2020-01-02 14:20:00'
        //     }
		// ];
		res.json({
			status: 200,
			message: resultString
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
});

app.get('/disconnect', (req, res) => {
	try {
		gateway.disconnect();
		res.json({
			status: 200
		})
	}catch(error){
		console.log('error')
		console.log(error)
		res.json({
			status: 500,
			message: error
		})
	}
	
})

async function connectToBC(){
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg1);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			contract = network.getContract(chaincodeName);

		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			// gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

connectToBC();

http.listen(port, () => {
    console.log(`Web3 client server running at http://127.0.0.1:${port}/`);
});
