'use strict';

const Hapi = require('@hapi/hapi');
const Bcrypt = require('bcrypt');
const axios = require("axios");


const BASE_URL = "https://swapi.dev/api/";
const URL_VALUES = ["films/?","people/?","species/?","starships/?","vehicles/?","planets/?"]


const GetAllData = async (end_url) => {
    let response =[];
    let k=0,j=0,i=0;
    let stock =[];
    let reg = /\/[0-9]+\//s;
    while(k<URL_VALUES.length)
    {
        stock.push(await GetData(URL_VALUES[k],end_url));
        k+=1;
    }
    while(i<stock.length){
        j=0;
        while(j<stock[i].length){
            response.push(stock[i][j]);
            
            j+=1;
        }
        i+=1;
    }
    response.forEach((element,index) => {
        element.id = index;
        element.type = element.url.replace("https://swapi.dev/api/","");
        element.type = element.type.replace(reg,"");
    });
    
    return response;
}

const GetData = async (search,end_url) => {

    let num = 1;
    let url = BASE_URL + search + "page=" + num + end_url;
    let value = null;
    let acc = {};
    let response = [];
    let checker = true;

    try{
        value = await axios.get(url);
    }catch(err){
        value = err.response;
    } finally{

        if(value.status != 200)
        {
            return {Error: value.status}
        }

        else{

            while(value.data.next != null || (value.data.next === null && checker === true)){

                if(value.data.next === null){
                    checker = false;
                }
                for(let i=0;i<10;i++){  
                    acc =value.data.results[i];
                    if(acc != null){
                        response.push(acc);
                    }
                }
                if(checker!=false){
                    num+=1;
                    url = BASE_URL + search + "page=" + num + end_url;
                    value = await axios.get(url);
                }
            }

            return response;
        }
        
    }  
    
};


const users = {
    Luke: {
        username: 'Luke',
        password: '$2b$10$oKg3n.CCo6eDLTR3r4NME.77MJtd5gsVFMOg7oFxQYO7wpHb3AxEG',
        id: 0,
        name: 'Luke',
    }
};


const validate = async (request,username,password,h) => {

    const user = users[username];
    if(!users[username]){
        return {isValid: false};
    }
    const match = await Bcrypt.compare(password,user.password);
    if(match){
        return { isValid: true, credentials:{id: user.id, name:user.name}};
    }
    else{
        return {isValid: false};
    }

};

const init = async () => {

    const server = Hapi.server({
        port: process.env.PORT || 3001,
        host: /*'0.0.0.0'*/"localhost",
        routes: {
            cors:{
                origin: ['*'],
                headers: ['Authorization'],
                exposedHeaders: ['Accept'],
                additionalExposedHeaders: ['Accept'],
                credentials: true
            }
        }
    });
    await server.register([{
        plugin: require("@hapi/basic")
    }]);

    server.auth.strategy('login','basic',{validate});
    server.route({
        method:'GET',
        path:'/',
        handler: (request,h) => {
            let end_url ="&format=json";
            return GetAllData(end_url);
        },
        options: {
            auth: 'login',
            cors:true
        }
    });

    server.route(
        {
        method:'GET',
        path:'/Planet',
        handler: (request,h) => {
            let search = "planets/?"
            let end_url ="&format=json";    //if format wookiee => add url 
            let res = GetData(search,end_url);
            return res;        

        },
        options: {
            auth: 'login'
        }
    },
    );

    server.route({
        method:'GET',
        path:'/Starships',
        handler: (request,h) => {
            let search = "starships/?"
            let end_url ="&format=json";    //if format wookiee => add url 
            let res = GetData(search,end_url);
            return res;
        },
        options: {
            auth: 'login'
        }
    });

    server.route({
        method:'GET',
        path:'/Vehicles',
        handler: (request,h) => {
            let search = "vehicles/?"
            let end_url ="&format=json";    //if format wookiee => add url 
            let res = GetData(search,end_url);
            return res;
        },
        options: {
            auth: 'login'
        }
    });

    server.route({
        method:'GET',
        path:'/People',
        handler: (request,h) => {
            let search = "people/?"
            let end_url ="&format=json";    //if format wookiee => add url 
            let res = GetData(search,end_url);
            return res;
        },
        options: {
            auth: 'login'
        }
    });

    server.route({
        method:'GET',
        path:'/Films',
        handler: (request,h) => {
            let search = "films/?"
            let end_url ="&format=json";    //if format wookiee => add url 
            let res = GetData(search,end_url);
            return res;
        },
        options: {
            auth: 'login'
        }
    });

    server.route({
        method:'GET',
        path:'/Species',
        handler: (request,h) => {
            let search = "species/?"
            let end_url ="&format=json";    //if format wookiee => add url 
            let res = GetData(search,end_url);
            return res;
        },
        options: {
            auth: 'login'
        }
        
    });

    server.route({
        method:'GET',
        path:'/{any*}',
        handler: (request,h) => {
            return "<h1>Erreur 404 - Mauvaise manipulation jeune padawan</h1>";
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
