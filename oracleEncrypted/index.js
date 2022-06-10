/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const taxOracleEncrypted = require('./lib/taxOracleEncrypted');

module.exports.TaxOracleEncrypted = taxOracleEncrypted;
module.exports.contracts = [taxOracleEncrypted];