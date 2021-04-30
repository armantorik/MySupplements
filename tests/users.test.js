const user = require('../models/users/users');

const order = user.order
const decrementFromBasket = user.decrementFromBasket

test('This test checks if the order returns a valid oid', () => {
    expect(order('emre_muslu@gmail.com')).toBeDefined();
})

test('Checks if we can decrement an item from the basket', () => {
    expect(decrementFromBasket('emre_muslu@gmail.com', 2)).toBeDefined();
})

