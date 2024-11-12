var express = require('express');
var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { resolve } = require('path');
const { reject } = require('bcrypt/promises');


module.exports = {

    checkPin: (details, pin) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let isUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(details._id) })
            console.log('user', isUser);

            if (isUser) {
                let checkPin = await bcrypt.compare(pin, isUser.Pin).then((status) => {
                    if (status) {
                        response.status = true
                        resolve(response)
                    } else {
                        response.status = false
                        response.message = 'Incorrect Pin'
                        resolve(response)
                    }
                })


            } else {
                response.status = false
                response.message = 'No user '
                resolve(response)
            }
        })
    },
    checkPremiumPin: (details, pin) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let isUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(details._id) })
            console.log('user', isUser);


            if (isUser.PremiumPin) {
                let checkPin = await bcrypt.compare(pin, isUser.PremiumPin).then((status) => {
                    if (status) {
                        response.status = true
                        resolve(response)
                    } else {
                        response.status = false
                        response.message = 'Incorrect Pin'
                        resolve(response)
                    }
                })


            } else {
                response.status = false
                response.message = 'No Premium In This Account'
                resolve(response)
            }
        })
    },

    changePremium: (uid, details) => {
        return new Promise(async (resolve, reject) => {
            let isPremium = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
            if (isPremium.Premium) {
                console.log('Premium is in ');
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(uid) },
                    {
                        $set: { Premium: false }
                    })
                let lsUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
                resolve(lsUser)
            } else {
                console.log('No premium');

                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(uid) },
                    {
                        $set: { Premium: true }
                    }
                )
                let lsUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
                resolve(lsUser)
                console.log(' premium updated');
            }


        })
    },
    deposite: (id, amount) => {
        const date = new Date().toLocaleString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        const detObj = {

            deposite: amount.amount,
            date: date
        }

        console.log('debosite obj', detObj);
        return new Promise(async (resolve, reject) => {
            console.log('det', id, amount);

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(id) })
            console.log(user);
            if (user) {
                let upAmount = await user.amount + parseInt(amount.amount)
                console.log('new amount', upAmount);

                let userData = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(id) },
                    { $set: { amount: upAmount } })
                console.log(userData);
                let userLast = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(id) })
                console.log('n', userLast);

                resolve(userLast)
            }

            let isFromUserTran = await db.get().collection(collection.WALLET_TRANSATION_COLLECTION).findOne({ user: id })
            if (isFromUserTran) {
                console.log('from user is in the data base', isFromUserTran);
                db.get().collection(collection.WALLET_TRANSATION_COLLECTION).updateOne(
                    { user: id },
                    {
                        $push: { transations: detObj }
                    }
                ).then((response) => {
                    console.log('updated transation');
                    resolve()
                })


            } else {
                let tranObj = {
                    user: id,
                    transations: [detObj]
                }
                console.log('tran obj', tranObj);

                db.get().collection(collection.WALLET_TRANSATION_COLLECTION).insertOne(tranObj).then((response) => {
                    console.log('tran aded');
                    resolve()
                })
            }

        })
    },
    withdraw: (id, amount) => {
        const date = new Date().toLocaleString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        const detObj = {

            withdraw: amount.amount,
            date: date
        }

        console.log('withdraw obj', detObj);
        return new Promise(async (resolve, reject) => {
            console.log('det', id, amount);

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(id) })
            console.log(user);
            if (user) {
                let upAmount = await user.amount - parseInt(amount.amount)
                console.log('new amount', upAmount);

                let userData = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(id) },
                    { $set: { amount: upAmount } })
                console.log(userData);
                let userLast = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(id) })
                console.log('n', userLast);
                resolve(userLast)
            }


            let isFromUserTran = await db.get().collection(collection.WALLET_TRANSATION_COLLECTION).findOne({ user: id })
            if (isFromUserTran) {
                console.log('from user is in the data base', isFromUserTran);
                db.get().collection(collection.WALLET_TRANSATION_COLLECTION).updateOne(
                    { user: id },
                    {
                        $push: { transations: detObj }
                    }
                ).then((response) => {
                    console.log('updated transation');
                    resolve()
                })


            } else {
                let tranObj = {
                    user: id,
                    transations: [detObj]
                }
                console.log('tran obj', tranObj);

                db.get().collection(collection.WALLET_TRANSATION_COLLECTION).insertOne(tranObj).then((response) => {
                    console.log('tran aded');
                    resolve()
                })
            }


        })
    },
    doSignup: (userData) => {
        console.log('userdata', userData);

        return new Promise(async (resolve, reject) => {
            let response = {}
            let userExist = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: userData.Mobile })
            let UidExist = await db.get().collection(collection.USER_COLLECTION).findOne({ Uid: userData.Uid })
            if (userExist) {
                console.log('already have the user');
                response.status = false
                response.message = 'This number is already taken '
                resolve(response)

            } else if (UidExist) {
                response.status = false
                response.message = 'This Uid is already taken'
                console.log('already have the Uid');
                resolve(response)
            }
            else {
                userData.Password = await bcrypt.hash(userData.Password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                console.log('signup success');
                response.status = true
                response.user = userData
                resolve(response)
            }
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            console.log(userData);
            let isMobile = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: userData.Mobile })
            if (isMobile) {
                console.log(isMobile);
                console.log('Mobile is in ');
                bcrypt.compare(userData.Password, isMobile.Password).then((status) => {
                    if (status) {
                        response.status = true
                        response.user = isMobile
                        console.log('Login success');
                        resolve(response)

                    } else {
                        response.status = false
                        response.message = 'Incorrect Password'
                        console.log('incorrect pass');
                        resolve(response)

                    }
                })
            } else {
                response.status = false
                response.message = 'Invalid Mobile'
                console.log('user Not avalible');
                resolve(response)
            }
        })
    },
    createAccount: (uid, pin) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
            console.log('user', user);
            let bcPin = await bcrypt.hash(pin, 10)
            console.log('bcpin', bcPin);

            const amount = 2
            if (!user.amount) {
                if (user) {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(uid) },
                        {
                            $set: { amount: amount, Pin: bcPin },

                        }
                    ).then((response) => {
                        console.log(response);

                    })

                }
            }
            let lsUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
            console.log('lst created user', lsUser);

            resolve(lsUser)

        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            console.log(allUsers);
            resolve(allUsers)
        })

    },
    sendAmount: (id, details) => {
        console.log('server amtsnd', id, details);

        return new Promise(async (resolve, reject) => {



            console.log('det', id, details.Amount);

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(id) })
            console.log(user);
            if (user) {
                let upAmount = await user.amount - parseInt(details.Amount)
                console.log('new amount', upAmount);

                let userData = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(id) },
                    { $set: { amount: upAmount } })
                console.log(userData);

            }


            console.log('det', id, details.Amount, 'to id', details.To);

            let toUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(details.To) })
            console.log(toUser);
            if (toUser) {
                let toUpAmount = await toUser.amount + parseInt(details.Amount)
                console.log('new amount', toUpAmount);

                let toUserData = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(details.To) },
                    { $set: { amount: toUpAmount } })
                console.log(toUserData);

            }
            let lastUser = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(id) })
            console.log('send amout last result', lastUser);
            resolve(lastUser)
        })
    },
    addTransation: (details, userId) => {
        const date = new Date().toLocaleString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        const detObj = {
            to: details.To,
            amount: details.Amount,
            date: date
        }
        console.log('obj', detObj);

        return new Promise(async (resolve, reject) => {
            let isFromUserTran = await db.get().collection(collection.TRANSATION_COLLECTION).findOne({ user: userId })
            if (isFromUserTran) {
                console.log('from user is in the data base', isFromUserTran);
                db.get().collection(collection.TRANSATION_COLLECTION).updateOne(
                    { user: userId },
                    {
                        $push: { transations: detObj }
                    }
                ).then((response) => {
                    console.log('updated transation');
                    resolve()
                })


            } else {
                let tranObj = {
                    user: userId,
                    transations: [detObj]
                }
                console.log('tran obj', tranObj);

                db.get().collection(collection.TRANSATION_COLLECTION).insertOne(tranObj).then((response) => {
                    console.log('tran aded');
                    resolve()
                })
            }
        })
    },

    getDebitedTran: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Convert userId to an ObjectId if possible
                let objectIdUserId;
                try {
                    objectIdUserId = new ObjectId(userId);
                } catch (e) {
                    objectIdUserId = null; // userId might not be a valid ObjectId
                }

                let isTran = await db.get().collection(collection.TRANSATION_COLLECTION).aggregate([
                    {
                        $match: {
                            $or: [
                                { user: userId },                  // Match as a string
                                { user: objectIdUserId }           // Match as an ObjectId
                            ]
                        }
                    },
                    { $unwind: '$transations' },
                    {
                        $project: {
                            to: { $convert: { input: '$transations.to', to: 'objectId', onError: null } },
                            amount: '$transations.amount',
                            date: '$transations.date'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.USER_COLLECTION,    // Make sure this is the correct collection name
                            localField: 'to',
                            foreignField: '_id',
                            as: 'toUserDetails'
                        }
                    },
                    { $unwind: { path: '$toUserDetails', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            to: 1,
                            amount: 1,
                            date: 1,
                            toUserDetails: {
                                Name: '$toUserDetails.Name',
                                Mobile: '$toUserDetails.Mobile',
                                Uid: '$toUserDetails.Uid'
                            }
                        }
                    }
                ]).toArray();

                console.log('result tran', isTran);
                resolve(isTran);
            } catch (error) {
                reject(error);
            }
        });
    },
    getCreditedTran: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Convert userId to an ObjectId if possible
                let objectIdUserId;
                try {
                    objectIdUserId = new ObjectId(userId);
                } catch (e) {
                    objectIdUserId = null; // userId might not be a valid ObjectId
                }

                const transactions = await db.get().collection(collection.TRANSATION_COLLECTION).aggregate([
                    {
                        $match: {
                            'transations.to': { $in: [userId, objectIdUserId] }  // Match 'to' field with user's own ID
                        }
                    },
                    { $unwind: { path: '$transations', preserveNullAndEmptyArrays: true } },
                    {
                        $match: {
                            'transations.to': { $in: [userId, objectIdUserId] }  // Filter only credited transactions
                        }
                    },
                    {
                        $project: {
                            amount: '$transations.amount',
                            date: '$transations.date',
                            to: '$transations.to',
                            user: '$user' // Keep the user field from the transaction document
                        }
                    },
                    {
                        $lookup: {
                            from: collection.USER_COLLECTION,
                            let: { userId: '$user' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $or: [
                                                { $eq: ['$_id', '$$userId'] },
                                                { $eq: ['$_id', { $toObjectId: '$$userId' }] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'userDetails'
                        }
                    },
                    { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            amount: 1,
                            date: 1,
                            to: 1,
                            userDetails: {
                                Name: '$userDetails.Name',
                                Mobile: '$userDetails.Mobile',
                                Uid: '$userDetails.Uid'
                            }
                        }
                    }
                ]).toArray();

                console.log('User credited transactions: ', transactions);
                resolve(transactions);
            } catch (error) {
                reject(error);
            }
        });
    },

    getWalletTransation: (uid) => {
        return new Promise(async (resolve, reject) => {

            let tran = await db.get().collection(collection.WALLET_TRANSATION_COLLECTION).findOne({ user: uid })
            if (tran) {
                console.log('user wallet tran', tran.transations);
                resolve(tran.transations)
            } else {
                resolve()
            }
        })
    },
    addCheck: (details) => {

        details.status = true
        details.Code = parseInt(details.Code)
        console.log('details', details);
        let response = {}
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collection.CHECK_COLLECTION).findOne({ Code: details.Code })
            if (check) {
                response.status = false
                response.message = 'This code is already exist'
                console.log('code is already exsist', check);
                resolve(response)

            } else {
                db.get().collection(collection.CHECK_COLLECTION).insertOne(details)
                response.status = true
                resolve(response)
            }
        })
    },
    getCheck: (uid, code) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let isCode = await db.get().collection(collection.CHECK_COLLECTION).findOne({ Code: code })
           
            if (isCode) {
                let Amount=isCode.Rs
                console.log('code is in', isCode);
                if (isCode.status) {

                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
                    console.log(user);
                    if (user) {
                        let upAmount = await user.amount + parseInt(isCode.Rs)
                        console.log('new amount', upAmount);

                        let userData = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: new ObjectId(uid) },
                            { $set: { amount: upAmount } })
                        console.log(userData);
                        response.status = true
                        db.get().collection(collection.CHECK_COLLECTION).updateOne({Code:code},
                            {
                                $set:{status:false}
                            }
                        )
                        let userLast = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(uid) })
                        console.log('n', userLast);
                        resolve({response,userLast,Amount})

                    } else {
                        response.message = "No user Please Login Again"
                        response.status=false
                        resolve(response)
                    }
                } else {
                    response.message = "This Check is Already Claimed"
                    response.status = false
                    resolve(response)
                }


            } else {
                response.message = "Code not found"
                response.status = false
                console.log('code not found');
                resolve(response)

            }
        })
    }





}