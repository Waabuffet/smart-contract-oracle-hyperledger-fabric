'use strict';

const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
const request = require('request');

class TaxOracleEncrypted extends Contract {

  async CallFinanceTaxDepartment(ctx, owner){
      //since this is calling from a docker container, we need to reach the host IP where the API server is listening (host.docker.internal)
      var response = await this.GetRequest('http://host.docker.internal:8080/didOwnerPayTax.php?encrypted=true&user_id=' + owner);

      //* save value in the blockchain
      await this.AddUserTaxValue(ctx, owner, response.user_tax_payment);

      // return 'hello';
      // return Buffer.from(JSON.stringify(response));
      return JSON.stringify(response);
  }

  GetRequest(url){
      return new Promise(function (resolve, reject) {
          request(url, { json: true }, function (error, res, body) {
            if (!error && res.statusCode == 200) {
              resolve(body);
            } else {
              reject(error);
            }
          });
      });
  }

  async InitLedger(ctx) {
    const users = [
      {
          ID: 'IBRCL',
          taxPayment: true
      },
      {
          ID: 'JVNKL',
          taxPayment: false
      }
    ];

    for (const user of users) {
      user.docType = 'asset';
      await ctx.stub.putState(user.ID, Buffer.from(stringify(sortKeysRecursive(user))));
    }
  }

  async AddUserTaxValue(ctx, id, taxPayment) {
    const exists = await this.UserExists(ctx, id);
    if (exists) {
        this.UpdateUser(ctx, id, taxPayment);
    }else{
      const user = {
          ID: id,
          taxPayment: taxPayment
      };
      //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
      await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(user))));
      return JSON.stringify(user);
    }
  }

  async UpdateUser(ctx, id, taxPayment) {
    // overwriting original property with new property
    const updatedUser = {
        ID: id,
        taxPayment: taxPayment
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedUser))));
  }

  async UserExists(ctx, id) {
    const userJSON = await ctx.stub.getState(id);
    return userJSON && userJSON.length > 0;
  }

  async GetAllUsers(ctx) {
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

module.exports = TaxOracleEncrypted;
