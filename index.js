"use strict";
const   config = require('./config'),
        CoinbaseClient = require('coinbase').Client,
        Transaction = require('coinbase').Transaction
;


const client = new CoinbaseClient({'apiKey': config.api_key, 'apiSecret': config.api_secret});



// Helper function to display error message and then quit the program.
const processError = function(scope, err) {
    if (err != null) {
        console.log(scope + ': ' + err);
        process.exit(1);
    }
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

            if (diffHours < 24 && txn.status === 'completed' && txn.type === 'receive') {
                applicableAmountList.push(txn.amount);
                console.log(txn);
            }
        });

        if (applicableAmountList.length == 0) {
            console.log('No applicable transactions in the wallet. Program exits...');
            return -1;
        } else {
            var totalAmount = 0;
            applicableAmountList.forEach(function(amountObj, index) {
                totalAmount += parseFloat(amountObj.amount);
            });
            return totalAmount / 2.0;
        }


    } else {
        console.log('No transactions in the wallet. Program exits...');
        return -1;
    }
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
            console.log('Sending to ' + config.to_address + ' with amount ' + amount + ' ...');
            account.sendMoney(opts, function(err, txn) {
                processError(err);
                console.log('\n\nTransaction created: \n' + txn);
            });
        }
    });
});