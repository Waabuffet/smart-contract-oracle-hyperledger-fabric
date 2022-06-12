'use strict';

const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class PropertyTransfer extends Contract {

    async InitLedger(ctx) {
        const properties = [
            {
                ID: 'property1',
                latitude: '33.898290',
                longitude: '35.643253',
                owner: 'IBRCL',
                purchase_date: '2020-01-02 14:20:00'
            },
            {
                ID: 'property2',
                latitude: '32.240480', 
                longitude: '42.436585',
                owner: 'JVNKL',
                purchase_date: '2020-01-02 14:20:00'
            },
            {
                ID: 'property3',
                latitude: '39.987305',
                longitude: '34.808560',
                owner: '82V4W',
                purchase_date: '2020-01-02 14:20:00'
            },
            {
                ID: 'property4',
                latitude: '57.191616',
                longitude: '104.941213',
                owner: 'IBYXI',
                purchase_date: '2020-01-02 14:20:00'
            },
            {
                ID: 'property5',
                latitude: '-7.845575',
                longitude: '-49.045891',
                owner: 'IRXQD',
                purchase_date: '2020-01-02 14:20:00'
            },
            {
                ID: 'property6',
                latitude: '-25.921426',
                longitude: '24.778973',
                owner: 'DZFKS',
                purchase_date: '2020-01-02 14:20:00'
            }
        ];

        for (const property of properties) {
            property.docType = 'asset';
            await ctx.stub.putState(property.ID, Buffer.from(stringify(sortKeysRecursive(property))));
        }
    }

    async CreateProperty(ctx, id, latitude, longitude, owner, purchase_date) {
        const exists = await this.PropertyExists(ctx, id);
        if (exists) {
            throw new Error(`The property ${id} already exists`);
        }

        const property = {
            ID: id,
            latitude: latitude,
            longitude: longitude,
            owner: owner,
            purchase_date: purchase_date
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(property))));
        return JSON.stringify(property);
    }

    async GetOwnerTaxPayments(ctx, owner){
        
        let response = await ctx.stub.invokeChaincode('tax-oracle', ['CallFinanceTaxDepartment', owner]);
        let encryptedResponse = await ctx.stub.invokeChaincode('tax-oracle-encrypted', ['CallFinanceTaxDepartment', owner]);

        let jsonResp = response.payload.toString();
        let encryptedJsonResp = encryptedResponse.payload.toString();
        console.log('got responses from oracles. non encrypted:')
        console.log(jsonResp);
        console.log('encrypted:');
        console.log(encryptedJsonResp);
        if(!this.OracleResponseMatch(ctx, encryptedJsonResp, jsonResp)){
            throw new Error('Response mismatch between oracles');
        }
        
        // console.log('logging from contract');
        // console.log(jsonResp);
        // console.log(typeof jsonResp);
        return jsonResp; //already a string
        // console.log('================================');
        // console.log('original response from oracle:');
        // console.log(response.payload.toString());
        // console.log(typeof response.payload);
        // console.log('================================');
        // let args = await ctx.stub.getArgs();
        // console.log('ctx args');
        // console.log(args);
        // console.log('================================');
        // let jsonResp = JSON.parse(Buffer.from(stringify(response.payload.data), 'base64').toString('ascii'));
        // console.log('response json:');
        // console.log(jsonResp);
        // console.log(typeof jsonResp);
        // console.log('================================');
        // console.log('response json to json:');
        // console.log(JSON.parse(stringify(jsonResp.data)));
        // console.log(typeof response);
        // console.log('================================');
        // return stringify(response); //.payload.toString('utf8'); 
        // return Buffer.from(stringify(sortKeysRecursive(response.payload.data)));
        // first attempt response
        // {"status":200,"payload":{"type":"Buffer","data":[123,34,109,101,115,115,97,103,101,34,58,34,104,101,108,108,111,32,102,114,111,109,32,65,80,73,34,125]}}
    }

    async OracleResponseMatch(ctx, encryptedResponse, nonEncryptedResponse){
        let jsonEncryptedResponse = JSON.parse(encryptedResponse);
        let decryptedResponse = await ctx.stub.invokeChaincode('decryptor', ['decryptMessage', jsonEncryptedResponse.user_tax_payment.toString()]);
        let decryptedReponseString = decryptedResponse.toString();
        let jsonNonEncryptedResponse = JSON.parse(nonEncryptedResponse);
        return decryptedReponseString == jsonNonEncryptedResponse.user_tax_payment;
    }

    async ReadProperty(ctx, id) {
        const propertyJSON = await ctx.stub.getState(id); // get the property from chaincode state
        if (!propertyJSON || propertyJSON.length === 0) {
            throw new Error(`The property ${id} does not exist`);
        }
        return propertyJSON.toString();
    }

    async UpdateProperty(ctx, id, latitude, longitude, purchase_date) {
        const exists = await this.PropertyExists(ctx, id);
        if (!exists) {
            throw new Error(`The property ${id} does not exist`);
        }

        // get owner of property (this function should not change the owner, we have TransferProperty() for that)
        const oldPropertyString = await this.ReadProperty(ctx, id);
        const oldProperty = JSON.parse(oldPropertyString);

        // overwriting original property with new property
        const updatedProperty = {
            ID: id,
            latitude: latitude,
            longitude: longitude,
            owner: oldProperty.owner,
            purchase_date: purchase_date,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedProperty))));
    }

    async DeleteProperty(ctx, id) {
        const exists = await this.PropertyExists(ctx, id);
        if (!exists) {
            throw new Error(`The property ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    async PropertyExists(ctx, id) {
        const propertyJSON = await ctx.stub.getState(id);
        return propertyJSON && propertyJSON.length > 0;
    }

    async TransferProperty(ctx, id, newOwner) {
        let ownerTaxPaymentString = await this.GetOwnerTaxPayments(ctx, newOwner);
        let ownerTaxPayment = JSON.parse(ownerTaxPaymentString);

        if(ownerTaxPayment.status != 200){
            throw new Error(`The owner ${newOwner} does not exist`);
        }

        if(ownerTaxPayment.user_tax_payment == false){
            console.log('owner info');
            console.log(ownerTaxPayment);
            throw new Error(`The owner ${newOwner} has not paid his taxes`);
        }

        const propertyString = await this.ReadProperty(ctx, id);
        const property = JSON.parse(propertyString);
        const oldOwner = property.owner;
        property.owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(property))));
        return oldOwner;
    }

    async GetAllProperties(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = PropertyTransfer;
