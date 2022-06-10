/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const decryptor = require('./lib/decruptor');

module.exports.Decryptor = decryptor;
module.exports.contracts = [decryptor];
