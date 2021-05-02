// Imported Modules
const assert = require('chai').assert;
var expect = require('chai').expect;

// Imported functions to be tested
const getProductsFromBasket = require('../models/users/users.js').getProductsFromBasket 
const createAccount = require('../models/users/users.js').createAccount 
const add2basket = require('../models/users/users.js').add2basket 
const removeAccount = require('../models/users/users.js').removeAccount 
const removeFromBasket = require('../models/users/users.js').removeFromBasket 
const decrementFromBasket = require('../models/users/users.js').decrementFromBasket 
const order = require('../models/users/users.js').order 
const resPAss = require('../views/js/forgetPass').resPAss



var email = "test:" + Math.random();

describe('Create Account', () => {

       it('Should fail to return if called without parameters', function() {
        createAccount().then(function(data){
                expect(data).to.be.undefined;
            });
    });
       it('Should return true when parameters valid', function() {
        createAccount(email, "newName", "newName", "newName",2, "newName", "newName").then(function(data){
                expect(data).to.be.true;
        });
    });

    

   });
describe('Remove Account', () => {

   it('Should return true when parameters valid', function() {
    removeAccount(email).then(function(data){
            expect(data).to.be.true;
    });
});

    it('Should return true when parameters valid', function() {
        removeAccount("email").then(function(data){
                expect(data).to.be.true;
        });
    });
   });

describe('Add to basket', () => {

    it('Should give errors if email is invalid', function(){
        expect(function(){add2basket("invalidEmail", 2)}).to.be.false;
    });

});

describe('Remove from basket', () => {

    it('Should give errors if email is invalid', function(){
        expect(function(){removeFromBasket("invalidEmail", 2)}).to.be.null;
    });

});


describe('Decrement from basket', () => {

    it('Should give errors if email is invalid', function(){
        expect(function(){decrementFromBasket("invalidEmail", 2)}).to.be.null;
    });

});

describe('Order from basket', () => {

    it('Should fail if email s wrong', function() {
        order("invalidEmail").then(function(data){
                expect(data).to.be.null;
            });
    });
    it('Should work if email s correct', function() {
        order("emre_muslu@gmail.com").then(function(data){
                expect(data).to.be.string;
            });
    });
});

describe('getProducts from db', () => {

    it('Should fail if email s wrong', function() {
        getProductsFromBasket("invalidEmail").then(function(data){
                expect(data).to.be.null;
            });
    });
    it('Should work if email s correct', function() {
        getProductsFromBasket("emre_muslu@gmail.com").then(function(data){
                expect(data).not.to.be.undefined;
            });
    });
});
