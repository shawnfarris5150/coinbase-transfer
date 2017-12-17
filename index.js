"use strict";
var config = require('./config'),
    CoinbaseClient = require('coinbase').Client,
    Transaction = require('coinbase').Transaction
;


var client = new CoinbaseClient({'apiKey': config.api_key, 'apiSecret': config.api_secret});



// Helper function to display error message and then quit the program.
var processError = function(scope, err) {
    if (err != null) {
        console.log(scope + ': ' + err);
        process.exit(1);
    }
}


var processTransactions = function(txList) {
    if ( !(txList instanceof Array(Transaction)) ) {
        throw "An array of type 'Transaction' is expected.";
    }
    // TODO
}


client.getCurrentUser(function(err, user) {
    processError(err);

    console.log('Logged in as ' + user.name);
    console.log('================================================');

    // Get all transactions under a specific address.
    client.getAccount(config.account_id, function(err, account) {
        processError('Get Account', err);
        
        var amount = 0;
        account.getAddress(config.ethermine_addr_id, function(err, addr) {
            processError('Get Address', err);
            
            addr.getTransactions(null, function(err, txnList) {
                processError('Get Transactions', err);
                amount = processTransactions(txnList);
            });
            });

        if (amount > 0) {
            const opts = {
                'to': config.to_address,
                'amount': amount,
                'currency': 'ETH'
            };
            account.sendMoney(opts, function(err, txn) {
                processError(err);
                console.log('\n\nTransaction created: \n' + txn);
        });
        }
    });
});