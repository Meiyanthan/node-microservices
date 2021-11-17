const { AddressModel, CustomerModel } = require('../models');
const  { APIError, BadRequestError, STATUS_CODES } = require('../../utils/app-errors');

// dealing with database
class CustomerRepository {
    
    async CreateCustomer({email, password, phone, salt}) {
        try {
            const customer = new CustomerModel({
                email,
                password,
                phone,
                salt,
                address: [] 
            });
            const customerResult = await customer.save();
            return customerResult;
        } catch (err) {
            throw new APIError('API Error',STATUS_CODES.INTERNAL_ERROR,'Unable to Create Customer');
        }
    }

    async FindCustomer ({email}){
        try {
            const exitingCustomer = await CustomerModel.findOne({email: email});            
            return exitingCustomer;
        
        } catch(err) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR,'Unable to Get Customer');
        }
    }

    async CreateAddress ({_id, street, postalcode, city, country}) {
        try {
            const profile = await CustomerModel.findById(_id);
            if(profile) {

                const newaddress = new AddressModel({
                    street,
                    postalcode,
                    city,
                    country
                });
               
                await newaddress.save();

                profile.address.push(newaddress); 
            }
            return await profile.save();
        
        } catch (err) {
            throw new APIError('APIError',STATUS_CODES.INTERNAL_ERROR,'Unable to Create Address');
        }
    }

    async FindCustomerById ({id}) {
        try {
            const profile = await CustomerModel.findById(id).populate('address');

            return profile;

        } catch (err) {
            throw new APIError('APIError', STATUS_CODES.INTERNAL_ERROR,'Unable to Find Customer');
        }
    }
     
    async WishList ({customerId}) {
        try {
            const profile = await CustomerModel.findById(customerId).populate('wishlist');
            return profile.wishlist;
        
        } catch (err) {
            throw new APIError('APIError', STATUS_CODES.INTERNAL_ERROR,'Unable to Get WishList');
        }
    }

    async AddWishlistItems(customerId, {_Id, name, desc, price, available, banner}) {
        const product = { 
            _Id, name, desc, price, available, banner 
        };
        
        try {
            const profile = await CustomerModel.findById(customerId).populate('wishlist');

            if(profile){
                let wishlist = profile.wishlist;

                if(wishlist.length > 0) {
                    let ifExist= false;
                    wishlist.map( item => {
                        if(item._id.toString() === product._id.toString()){
                            let index = wishlist.indexof(item);
                            wishlist.splice(index, 1);
                            ifExist = true;
                        }
                    })

                    if(!ifExist){
                        wishlist.push(product);
                    }

                }else{
                    wishlist.push(product);
                }

                profile.wishlist = wishlist;
            }

            const profileResult = await profile.save();
            return profileResult.wishlist;
        
        } catch (err) {
            throw new APIError('APIError',STATUS_CODES.INTERNAL_ERROR, 'Unable to Add to WishList');
        }
    }

    async AddToCartItems (customerId, {_id, name, price, banner}, qty, isRemove){
        try {
            const profile = await CustomerModel.findById(customerId).populate('cart');
            
            const cartItem = {
                product: {_id, name, price, banner},
                unit: qty 
            }
            
            let cartItems = profile.cart;
            
            if(cartItems.length > 0) {
                ifExist = false;
                cartItems.map( item => {
                    if(item.product._id.toString() === _id.toString()){
                        if(isRemove){
                            cartItems.splice(cartItems.index(item), 1);
                        }else{
                            item.unit = qty;
                        }
                        ifExist = true;
                    }

                })

                if(!ifExist) {
                    cartItems.push(cartItem);
                }
            }else{
                cartItems.push(cartItem);
            }
            profile.cart = cartItems;;

            const cartAddedRes = await profile.save();
            return cartAddedRes;

        } catch(err) {
            throw new APIError('APIError', STATUS_CODES.INTERNAL_ERROR, 'Unable to Add to Cart');
        }
    }

    async AddOrderToProfile(customerId, order) {
        try {
            const profile =  await CustomerModel.findById(customerId);
            
            if(profile) {
                if(profile.orders == undefined) {
                    profile.orders = [];
                }

                profile.orders.push(order);

                profile.cart = [];

                const orderRes = await profile.save();
                return orderRes;
            }

            throw new APIError('Unable to add to order!!!');

        
        } catch(err) {
            throw new APIError('APIError', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Order to Profile');
        }
    }
}

module.exports = CustomerRepository;