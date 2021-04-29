const assert = require('chai').assert;
const getProductsFromBasket = require('../models/products/user').getProductsFromBasket
describe('User Get Products Test', () => {
    it('should return 2', () => {
           assert.equal(getProductsFromBasket(), 2);
       });
    it('should return 9', () => {
           assert.equal(3 * 3, 9);
       });
   });