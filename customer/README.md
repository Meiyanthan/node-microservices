# Start the server
Development - npm run dev

Production - npm run start

# Config
dotenv file get and export

# Database
connection used by db connect

## models
Collection Creation

## repository
Database logic

# Service
Business logic

# Utils
Utility functions - common reusable functions
Error Handling middleware
API Error handling & Status Codes

# Api
API Service Creation - route

## middleware


### NPM to INSTALL PACKAGES
npm install -g packagename

npm install --save packagename

npm install --save --dev packagename



### Moongoose Query

> db.addresses.find({}).pretty();

> db.customers.find({'_id':ObjectId('61816924bd043ea554bb3639')}).pretty();

> db.addresses.remove({})

> db.addresses.drop()


### PORT EXISTING KILL

> sudo lsof -i :8001

> sudo kill -9 23512

