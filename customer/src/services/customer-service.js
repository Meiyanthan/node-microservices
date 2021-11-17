const { CustomerRepository } = require('../database')
const { ValidatePassword, GenerateSalt, GeneratePassword, GenerateSignature, FormatData } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors');

// All Business Logic
class CustomerService {

    constructor(){
        this.repository = new CustomerRepository();
    }

    async SignUp(userInput){

        const { email, password, mobile } = userInput;

        try {
            let salt = await GenerateSalt();

            let userPassword = await GeneratePassword(password, salt);

            const existingCustomer = await this.repository.CreateCustomer({email, password: userPassword, mobile, salt});

            const token = await GenerateSignature({email:email, _id: existingCustomer._id});

            return FormatData({id: existingCustomer._id, token});
 
        } catch (err) {
            throw new APIError(err);
        }
 
    }

    async SignIn (userInputs) {

        const { email, password } = userInputs;
        try {
            const existingCustomer = await this.repository.FindCustomer({email});

            if(existingCustomer) {
            
                const uservalidation = await ValidatePassword(password,existingCustomer.password,existingCustomer.salt);
                if(uservalidation) {
                    const token = await GenerateSignature({email: existingCustomer.email,_id: existingCustomer._id});
                    return FormatData({id:existingCustomer._id, token});
                }
            }
            return FormatData({'message':'Customer or Password is Incorrect'});
        
        } catch(err) {
            throw new APIError('Customer not found', err);
        }
    }

    async AddNewAddress(_id, userInputs) {
        const { street, postalcode, city, country } = userInputs;
        
        try {
            const addressResult = await this.repository.CreateAddress({_id, street, postalcode, city, country})
            // console.log(addressResult)
            return FormatData(addressResult);

        } catch (err) {
            throw new APIError('Data not found - Addresses',err);
        }
    }

    async GetProfile(id) {
        try {
            const profileRes = await this.repository.FindCustomerById({id});
            return FormatData(profileRes);
        
        } catch(err) {
            throw new APIError('Data not found - Profile', err);
        }
    }

    async GetShoppingDetails(id) {
        try {
            const existingCustomer = await this.repository.FindCustomerById({id});
            if(existingCustomer) {
                return FormatData(existingCustomer);
            }

            return FormatData({msg : 'Error'});

        } catch (err) {
            throw new APIError('Data not found - Shopping Details', err);
        }
    }

    async GetWishList(customerId){
        try {
            const wishLists = await this.repository.WishList({customerId});

            return FormatData(wishLists);
        
        } catch (err) {
            throw new APIError('Data not found - WishList',err);
        }
    }

    async ManageWishlist(customerId, product) {
        try {
            const wishlistRes = await this.repository.AddWishlistItems(customerId, product);
            return FormatData(wishlistRes); 
        
        } catch (err) {
            throw new APIError('Data not found - ManageWishlist',err);
        }
    }

    async ManageCart(customerId, product, qty, isRemove) {
        try{
            const cartRes =  await this.repository.AddToCartItems(customerId, product, qty, isRemove);
            return FormatData(cartRes);
        
        } catch(err) {
            throw new APIError('Data not found - ManageCart',err);
        }
    }

    async ManageOrder(customerId, order) {
        try {
            const orderRes = await this.repository.AddOrderToProfile(customerId, order);
            return FormatData(orderRes);

        } catch(err) {
            throw new APIError('Data not found - ManageOrder',err);
        }
    }

    async SubscribeEvents (payload) {

        const { event, data } = payload;
        const { userId, product, order, qty } = data;

        switch(event){
            case 'ADD_TO_WISHLIST':
            case 'REMOVE_WISHLIST':
                this.ManageWishlist(userId, product);
                break;
            case 'ADD_TO_CART':
                this.ManageCart(userId, product, qty, false);
            case 'REMOVE_FROM_CART':
                this.ManageCart(userId, product, qty, false);
            case 'CREATE_ORDER':
                this.ManageOrder(userId, order);
            default:
                break;
        }
    }
}

module.exports = CustomerService;