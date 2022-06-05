'use strict';

const { Contract } = require('fabric-contract-api');
const request = require('request');

class TaxOracle extends Contract {

    async CallFinanceTaxDepartment(ctx, owner){
        //since this is calling from a docker container, we need to reach the host IP where the API server is listening (host.docker.internal)
        var response = await this.GetRequest('http://host.docker.internal:8080/didOwnerPayTax.php?user_id=' + owner);
        
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

}

module.exports = TaxOracle;
