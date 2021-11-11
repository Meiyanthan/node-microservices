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
}

module.exports = CustomerRepository;