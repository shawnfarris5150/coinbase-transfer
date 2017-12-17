"use strict";
var config = require('./config'),
    CoinbaseClient = require('coinbase').Client,
    Transaction = require('coinbase').Transaction
;


var client = new CoinbaseClient({'apiKey': config.api_key, 'apiSecret': config.api_secret});



// Helper function to display error message and then quit the program.
var processError = function(err) {
    if (err != null) {
        console.log(err);
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

    console.log('Logged in as ' + user.username + ', ' + user.name);
    console.log('================================================');

    // Get all transactions under a specific address.
    client.getAccount(config.account_id, function(err, account) {
        processError(err);
        
        account.getAddress(config.ethermine_addr, function(err, addr) {
            processError(err);
            
            addr.getTransactions(null, function(err, txList) {
                processError(err);
                processTransactions(txList);
            });
        });
    });
});