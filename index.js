'use strict'
var config = require('config');
var creator = require('./controllers/CreatorController')();
// var request = require('request');
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/creator');
// var User = require('./models/User');
if(config.has("option.token")){
	 var token = config.get("option.token");
	 var tg = require('telegram-node-bot')(token);
	 //***********************************************
	 tg.router.
	    when(['/start'], 'StartController').
	      when(['/info'], 'StartController').
	       when(['/function'], 'StartController').
	        when(['/budget'], 'StartController').
	         when(['/phone'], 'StartController').
	          when(['/continue'], 'StartController').
	           when(['/check'], 'StartController').
	           when(['/final'], 'StartController').
	          otherwise('OtherwiseController');
	 //*********************************************************   
	tg.controller('OtherwiseController', ($) => {   
			$.routeTo('/start');
	}); 
	 //***********************************************
	tg.controller('StartController', ($) => {

	    tg.for('/start', () => {
			 $.sendMessage('Привет! Я Бот-Создатель. Нескромно, знаю :) '+
			 'Я помогу заказать нового бота. Как я могу к вам обращаться?');
			 console.log($);
			 creator.createUser({telegram: $.user.id, login: $.user.username}, (msg,data)=>{
			 	 $.waitForRequest(($) => {	
			 	 	if($.message.text[0]=='/'){
			 	 		$.routeTo($.message.text);
			 	 	}	
			 	 	else{
			 		creator.updateUser(data.telegram,{name:$.message.text, login: $.user.username},(err,data)=>{
			 			if(!err){
			 				
			 				$.routeTo('/info'); 
			 			}
			 		});	
			 	 }
            		          	
		   		}) 

			 });
			});


	     tg.for('/info', () => {
	     	
		      creator.getUser($.user.id, (err, data)=>{
		      		if(err){
						$.routeTo('/start'); 
		      		}
		      		else{
		      			creator.checkOrder($.user.id,(err)=>{
		      				if(err){
		      					$.sendMessage(data.name+', очень приятно! Давайте поговорим о вашем боте. '+
		      					 			'Не обязательно придумывать боту имя, лучше опишите в двух словах, '+
		      					 			'чем он будет полезен — например, бот для заказа пиццы.');
								$.waitForRequest(($) => {
									if($.message.text[0]=='/'){
			 	 						$.routeTo($.message.text);
			 	 					}
			 	 					else{
									 	creator.createOrder({user:$.user.id, date: Date.now(), description: $.message.text, complite: false, isSend: false, stage:2},(data)=>{
									 		$.routeTo('/function');  
								 		});				
			            		    }     	
					   			});
		      				}
		      				else{
		      				  $.routeTo('/continue'); 
		      				}

		      			})
		      		}

		      });
			 
	    });


	      tg.for('/continue', () => {
	      	creator.getOrder($.user.id, (err, data)=>{
	      		if(err){
	      			$.routeTo('/start'); 
	      		}
	      		else{
	      			var description;
	      			var capability;
	      			var hour = data.date.getHours();
	      			var minutes = data.date.getMinutes();
	      			if(hour.length < 9){
	      				hour = "0"+hour;
	      			}
	      			
	      			if(minutes < 9){
	      				minutes = "0"+minutes;
	      			}
	      			var date = ' '+config.get('option.date.week')[data.date.getDay()] +' '+ data.date.getDate()+' '+config.get('option.date.month')[data.date.getMonth()]+' в '+hour+':'+minutes;
	      			console.log(data.date.getDay());
	      			$.sendMessage('Вы начинали заполнять информацию о боте'+date+' (по Московскому времени). Желаете продолжить?');
	      			$.runMenu({
				    message: 'Выберите вариант:',
				    layout: 2,
					    'Начать заново': () => {
					    	creator.removeOrder($.user.id,(err,result)=>{
					    		if(result){
					    			$.routeTo('/info');
					    		}
					    		else{
					    			$.routeTo('/continue');
					    		}
					    	});

					    }, //will be on first line
					    'Продолжить': () => {
					    	console.log(data.stage);
					    	$.routeTo(config.get('option.stage.'+data.stage));
					    }, //will be on first line
					    
					});  
	      			}
	      		});		     
	      });


	      tg.for('/function', () => {

	      	creator.getOrder($.user.id, (err, data)=>{
	      		if(err){
	      			$.routeTo('/start'); 
	      		}
	      		else{
	      			$.sendMessage('Отлично! А теперь расскажите подробнее, что должен уметь ваш будущий бот и как он будет общаться с клиентами.');
	      			$.waitForRequest(($) => {	
	      				if($.message.text[0]=='/'){
			 	 			$.routeTo($.message.text);
			 	 		}
			 	 		else{
			 	 			creator.updateOrder($.user.id, {capability: $.message.text, stage: 3}, (err,data)=>{
		      					if(err){

		      					}
		      					else{
		      						$.routeTo('/budget'); 
		      					}
	      					});	
			 	 		}				
	      				
	            		          	
			   		});
	      		}

	      	});
		      
				  
	      });

	       tg.for('/budget', () => {


	       	$.runMenu({
				    message: 'Укажите примерный бюджет на разработку бота. Нажмите кнопку или введите цифрами:',
				    layout: 1,
					    'до 10000 рублей': () => {
						    creator.updateOrder($.user.id, {budget:'до 10000', stage: 4}, (err,data)=>{
		      					if(err){

		      					}
		      					else{
		      						$.routeTo('/phone'); 
		      					}
		      				});	

					    }, 
					    'до 50000 рублей': () => {
					    	 creator.updateOrder($.user.id, {budget:'до 50000', stage: 4}, (err,data)=>{
		      					if(err){

		      					}
		      					else{
		      						$.routeTo('/phone'); 
		      					}
		      				});	

					    }, 
					    'до 100000 рублей': () => {
					    	 creator.updateOrder($.user.id, {budget:'до 100000', stage: 4}, (err,data)=>{
		      					if(err){

		      					}
		      					else{
		      						$.routeTo('/phone'); 
		      					}
		      				});	

					    }, 
					    'anyMatch': ($) => { 
					    	if($.message.text[0]=='/'){
			 	 				$.routeTo($.message.text);
			 	 			}
			 	 			else{
			 	 				if(parseInt($.message.text)){
						    	 creator.updateOrder($.user.id, {budget:$.message.text, stage: 4}, (err,data)=>{
			      					if(err){

			      					}
			      					else{
			      						$.routeTo('/phone'); 
			      					}
			      				});
						    }
						    else{
						    	$.sendMessage('Пожалуйста, используйте только цифры');
						    	$.routeTo('/budget');
						    }
		      			  }		
   						}	
					}); 
		     
	      });

 tg.for('/phone', () => { 
  	var reg = /^( +)?((\+?7|8) ?)?((\(\d{3}\))|(\d{3}))?( )?(\d{3}[\- ]?\d{2}[\- ]?\d{2})( +)?$/
	creator.getOrder($.user.id, (err, data)=>{
		if(err){
			$.routeTo('/start');
		}
		else{
			creator.SendPhoneKeyboard($.chatId,'Укажите телефон',()=>{
				
				$.waitForRequest(($) => {

					if($.message.text && $.message.text[0]=='/'){
					 	 $.routeTo($.message.text);
					}
					else{

					var contact;
					var phone;	
					var email;
					
					if($.message.contact)
					{
						contact = $.message.contact.phone_number;
						phone = $.message.contact.phone_number;
						email='';
					}
					else{
						if(reg.test($.message.text)){
							contact = $.message.text;
							//email =  $.message.text;
							phone = $.message.text;

						}
						else{
							$.sendMessage('Введите номер в формате 79991234567 или нажмите кнопку');
						    $.routeTo('/phone');
						    return;
						}
						
					}

			      		creator.updateOrder($.user.id, {contact:contact, stage:5}, (err,result)=>{
			      					if(err){
			      						$.routeTo('/phone'); 
			      					}
			      					else{		      						
			      						creator.updateUser($.user.id,{phone:phone},(err)=>{
			      							$.routeTo('/check');
			      						});
			      						 
			      					}	
			            		          	
					});

			      }		
				});
			});
		}
 		});

	}); 


 	tg.for('/check', ($) => {   
		creator.getOrder($.user.id, (err, data)=>{
			if(err){
				$.routeTo('/start');
			}
			else{
				var msg = "Описание бота: "+data.description+'\n'+
				'Назначение бота: '+data.capability+'\n'+
				'Бюджет: '+data.budget+'\n'+
				'Контактная информация: '+data.contact+'\n'+
				'Все верно? ';

				$.runMenu({
				    message: msg,
				    layout: 2,
					    'Нет': () => {
						    
		      			    $.routeTo('/start'); 
		      					

					    }, 
					    'Да': () => {
						    creator.updateOrder($.user.id, {complite: true}, (err,result)=>{
		      					if(err){
		      						$.routeTo('/check');
		      					}
		      					else{
		      						creator.sendEmail(data._id);
		      						$.routeTo('/final');
		      					}
		      				});	

					    },
					    'anyMatch': ($) => { 
					    	if($.message.text[0]=='/'){
			 	 				$.routeTo($.message.text);
			 	 			}
			 	 			else{
			 	 				if($.message.text == 'да'){
					 	 			creator.updateOrder($.user.id, {complite: true}, (err,result)=>{
				      					if(err){
				      						$.routeTo('/check');
				      					}
				      					else{
				      						creator.sendEmail(data._id);
				      						$.routeTo('/final');
				      					}
				      				});	
			 	 				}
			 	 				else if($.message.text == 'нет'){
			 	 					 $.routeTo('/start'); 
			 	 				}
			 	 				else{
			 	 					$.sendMessage('Я понимаю только да или нет :)');
						    		$.routeTo('/check');
						   			 return;
			 	 				}
			 	 			}
			 	 			
		      			  }		
   						
				});

			}
		});
	}); 

 	tg.for('/final', ($) => { 
 		 	$.runMenu({
				    message: 'Отлично! С вами свяжется менеджер.\n',
				    layout: 1,
					    'Заполнить еще одну заявку': () => {						   	
					    	$.routeTo('/info');
					    }, 
			}); 
 	});

});
}
else{
	console.log("Укажите токен");
}