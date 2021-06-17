// Imported Modules
const assert = require('chai').assert;
var expect = require('chai').expect;

// Imported functions to be tested
const getInvoices = require('../controllers/users/admins.js').getInvoices; 
const removeExpired = require('../controllers/users/admins.js').removeExpired; 

describe('Get Invoices', () => {

       it('Should return an array', function() {
        getInvoices().then(function(data){
                expect(data).to.be.array;
            });
        });
    });
describe('Remove Expired', () => {

    it('Should return an array', function() {
        removeExpired().then(function(data){
                expect(data).to.be.array;
            });
        });
    });