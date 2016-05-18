'use strict'
var config = require('config');
var request = require('request');
var mongoose = require('mongoose');
mongoose.connect(config.get("option.db.url"));
var User = require('../models/User');
var Order = require('../models/Order');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(config.get('option.smtpConfig'));

class Creator{

	constructor() {
       
    }

    createUser(obj,callback){
    	User.findOne({telegram: obj.telegram},(err,data)=>{
        
    		if(err || data == null){
    			var user = new User({
            telegram: obj.telegram,
            login: obj.login
          });
				  user.save();
				  return callback('создан',user);

    		}
    		else{  		
    			return callback('найден',data);
    		}
    	});
	   
    }
    getUser(id, callback){
    	User.findOne({telegram: id},(err,data)=>{
    		if(err || data == null){
    			return callback('не найден', null);
    		}
    		else{
    			return callback(null, data);
    		}
    	});
    }
    updateUser(id,obj,callback){

      User.update({telegram: id},obj,(err,data)=>{
    		if(err){
    			var err = "Пользователь не найден";
    			return callback(err,null);
    		}
    		else{   			
    			return callback(null,data);
    		}
    	})   	
    }

    createOrder(obj, callback){

    	var order = new Order(obj);
		order.save();
		callback(order);
			
   }   
   checkOrder(id,callback){
   		Order.find({user: id, complite: false},(err,data)=>{
    		if(err || data.length == 0){
    			return callback('не найден');
    		}
    		else{
    			return callback(null);
    		}
    	});
   }
   getOrder(id, callback){
   	 Order.findOne({user: id, complite: false},(err,data)=>{
    		if(err || data == null){
    			return callback('не найден', null);
    		}
    		else{
    			return callback(null, data);
    		}
    	});
   }
   removeOrder(id,callback){
   	  Order.findOne({user: id, complite: false}).remove((err)=>{
   	  	if(err){
   	  		return callback(err, null);
   	  	}
   	  	else{
   	  		return callback(null, true);
   	  	}
   	  })
   }
   updateOrder(id,obj,callback){

      Order.update({user: id, complite: false},obj,(err,data)=>{
    		if(err){
    			var err = "не найден";
    			return callback(err,null);
    		}
    		else{   
    			console.log(data);			
    			return callback(null,data);
    		}
    	})   	
    }

SendPhoneKeyboard(chatid,msg,callback){	
	console.log(chatid);
		var token = config.get('option.token');
		var option = JSON.stringify({keyboard:[[{text:encodeURI('Укажите телефон'),request_contact:true}]]});
    console.log(option);
		var url = 'https://api.telegram.org/bot'+token+'/sendMessage?text='+encodeURI(msg)+'&chat_id='+chatid+'&reply_markup='+option;
     
		request({	  
			    url: url,
			    method: 'GET'
			  }, function (err, res, body) {
			  		return callback();  		  		
			  });
	}



  sendEmail(id){
    var creator = this;
    Order.findOne({_id:id},function(err, data){
      if(!err && data !== null){
        creator.getUser(data.user, function(err, user){
            if(!err){
             var msg = "<h3>Описание бота: </h3>"+data.description+'<br>'+
            '<h3>Назначение бота: </h3>'+data.capability+'<br>'+
            '<h3>Бюджет: </h3>'+data.budget+'<br>'+
            '<h3>Контактная информация:</h3>'+data.contact+'<br>'+
            '<h3>Телеграм клиента</h3><a href="https://telegram.me/'+user.login+'">'+user.login+'</a><br>';
            var to = config.get('option.mail.to');
            var mailOptions = {
                from: '"Fred Foo', // sender address 
                to: to, // list of receivers 
                subject: 'Order '+data.date, // Subject line 
                text: msg, // plaintext body 
                html: msg // html body 
            };

            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                return console.log(error);
              }
              console.log('Message sent: ' + info.response);
            });
          }

        })
       

      }
    })
  

  }

}


module.exports = function () {
    return new Creator();
}
	
