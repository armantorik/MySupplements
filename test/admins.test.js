// Imported Modules
const assert = require('chai').assert;
var expect = require('chai').expect;

// Imported functions to be tested
const getInvoices = require('../models/users/admins/admins.js').getInvoices; 
describe('Get Invoices', () => {

       it('Should return an array', function() {
        getInvoices().then(function(data){
                expect(data).to.be.array;
            });
        });
    });