
const moment = require('moment');
const userMaster = require('../models/user_master');
const md5 = require('md5');

async function checkUser(whereCondtion){
    return await userMaster.find()
            .where(whereCondtion);
}

module.exports = {
    async registerPage(req, res){
        return res.render('register');
    },

    async registerUser(req, res) {
        try{
            let params = req.body;
            let response = { 'statusCode': 1000 };

            if (
                params.userName != undefined && params.userName.trim() != '' 
                && params.name != undefined && params.name.trim() != '' 
                && params.password != undefined && params.password.trim() != ''
            ) {
                let getUserData = await checkUser({
                    user_name: params.userName
                });

                if(getUserData.length > 0){
                    response = { 'statusCode': 1001 };
                }else{
                    await userMaster.create({
                        name: params.name,
                        user_name: params.userName,
                        password: md5(params.password),
                        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
                    });
                    response = { 'statusCode': 200};
                }
            }
            return res.json(response);
        }catch(error){
            return res.json({"statusCode": 500 });
        }
    },

    async loginPage(req, res){
        return res.render('login');
    },

    async login(req, res){
        try{
            let params = req.body;
            let response = {'statusCode': 1000 };

            if (params.userName != undefined && params.userName.trim() != '' && params.password != undefined && params.password.trim() != '') {
                let getUserData = await checkUser({
                                        user_name: params.userName,
                                        password: md5(params.password),
                                    });

                if(getUserData.length > 0){
                    response = { 'statusCode': 200,  data : getUserData[0]};
                }else{
                    response = {'statusCode': 1002 };
                }
            }

            return res.json(response);
        }catch(error){
            return res.json({"statusCode": 500 });
        }
    }
}