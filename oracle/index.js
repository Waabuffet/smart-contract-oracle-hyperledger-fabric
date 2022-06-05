/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const taxOracle = require('./lib/taxOracle');

module.exports.TaxOracle = taxOracle;
module.exports.contracts = [taxOracle];