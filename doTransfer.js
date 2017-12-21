"use strict";
const   config = require('./config'),
        CoinbaseClient = require('coinbase').Client,
        Transaction = require('coinbase').Transaction
;


const client = new CoinbaseClient({'apiKey': config.api_key, 'apiSecret': config.api_secret});



// Helper function to display error message and then quit the program.
const processError = function(scope, err) {
    if (err != null) {
        throw scope + ': ' + err;
    }
}

var logStr = '';
const log = function(logEntry) {
    logStr += logEntry + '\n';
}


// Find if received a transaction in 24 hours. 
// If yes, half of the amount should be sent to my friend.
const processTransactions = function(txnList) {
    if (txnList.length != 0) {
        if ( !(txnList instanceof Array) && !(txnList[0] instanceof Transaction) ) {
            throw "An array of type 'Transaction' is expected.";
        }

        var applicableAmountList = [];
        const currentDate = new Date();
        txnList.forEach(function(txn, index) {
            const updatedDate = new Date(txn.updated_at);
            const diffHours = (currentDate - updatedDate) / (1000 * 60 * 60);

            if (diffHours < 24 && txn.status === 'completed' && txn.type === 'send') {
                applicableAmountList.push(txn.amount);
                log(txn);
            }
        });

        if (applicableAmountList.length == 0) {
            log('No applicable transactions in the wallet. Program exits...');
            return -1;
        } else {
            var totalAmount = 0;
            applicableAmountList.forEach(function(amountObj, index) {
                totalAmount += parseFloat(amountObj.amount);
            });
            return totalAmount / 2.0;
        }


    } else {
        log('No transactions in the wallet. Program exits...');
        return -1;
    }
}


const doTransfer = function(completion) {
    
    client.getCurrentUser(function(err, user) {
        processError(err);

        log('Logged in as ' + user.name);
        log('================================================');

        // Get all transactions under a specific address.
        client.getAccount(config.account_id, function(err, account) {
            processError('Get Account', err);

            // account.getAddresses(null, function(err, addr) {
            //     processError('Get All Addresses', err);
            //     log("All addresses for account " + account.name + ": ");
            //     addr.forEach(function(val, index) {
            //         log("  - " +  val);
            //     })
            // });
            
            account.getAddress(config.ethermine_addr_id, function(err, addr) {
                processError('Get Address', err);
                
                addr.getTransactions(null, function(err, txnList) {
                    processError('Get Transactions', err);
                    var amount = processTransactions(txnList);

                    if (amount > 0) {
                        const opts = {
                            'to': config.to_address,
                            'amount': amount,
                            'currency': 'ETH'
                        };
                        log('Sending to ' + opts.to + ' with ' + opts.currency + ' ' + opts.amount + ' ...');
                        account.sendMoney(opts, function(err, txn) {
                            processError(err);
                            log('\n\nTransaction created: \n' + txn);

                            var logToBeReturned = logStr;
                            logStr = '';
                            completion(logToBeReturned);
                        });
                    } else {
                        var logToBeReturned = logStr;
                        logStr = '';
                        completion(logToBeReturned);
                    }
                });
            });
        });
    });

};

module.exports = {
    doTransfer: doTransfer
};