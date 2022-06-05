/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const propertyTransfer = require('./lib/propertyTransfer');

module.exports.PropertyTransfer = propertyTransfer;
module.exports.contracts = [propertyTransfer];
