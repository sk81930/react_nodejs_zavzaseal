let baseResponse = require("../Util/baseResponse.js");
var bcrypt = require("bcrypt");
const jwtHelper = require('../Util/jwtHelper')
const db = require('../models');

const UserModal = db.User;

class SocketController {
   /**
    * @param {Model} model The default model object
    * for the controller. Will be required to create
    * an instance of the controller
    */
    constructor() {
	     // this._model = model;
	     // this.create = this.create.bind(this);
    }

      
    connection = async (io) => {

        let clients = [];

        const rooms = {};

        io.on('connection', socketClient => {

            console.log('Connected User: ', socketClient.user.id);

            //io.emit('online_users', clients);


            socketClient.on('add-client', data => {

                clients.push({ userId: data.id, socketId: socketClient.id });

                io.emit('online_users', clients);

            })

            socketClient.on('online_users', data => {
               io.emit('online_users', clients);
            });


            socketClient.on('disconnect', () => {

                clients = clients.filter((user) => user.socketId !== socketClient.id)

                console.log('Disconnected User: ', socketClient.user.id);

                io.emit('online_users',  clients);
            });

            socketClient.on('chat_message', data => {


                



                var existSenders = clients.filter((user) => user.userId == socketClient.user.id);

                if(existSenders && existSenders.length > 0){
                    existSenders.forEach(function(existSender){
                        if(existSender && existSender.socketId){
                            var senderClient = io.sockets.sockets.get(existSender.socketId);
                            if(senderClient){
                                senderClient.emit('chat_message', data);
                            }
                        }
                    })    
                }    





                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(receiverClient, data)
                            receiverClient.emit('chat_message', data);
                        }

                    })
                }

               
            });

            socketClient.on('user_typing', data => {




                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            receiverClient.emit('user_typing', data);
                        }

                    })
                }

               
            });

            socketClient.on('request', data => {




                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(data);
                            receiverClient.emit('request', data);
                        }

                    })
                }

               
            });

            socketClient.on('ready', data => {




                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(existReciever);
                            receiverClient.emit('ready', data);
                        }

                    })
                }

               
            });

            socketClient.on('offer', data => {




                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(data);
                            receiverClient.emit('offer', data.offer);
                        }

                    })
                }

               
            });

            socketClient.on('candidate', data => {




                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(data);
                            receiverClient.emit('candidate', data.candidate);
                        }

                    })
                }

               
            });

            socketClient.on('answer', data => {




                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(data);
                            receiverClient.emit('answer', data.answer);
                        }

                    })
                }

               
            });
            socketClient.on('endedStream', data => {


                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log(data);
                            receiverClient.emit('endedStream', data);
                        }

                    })
                }

               
            });
            socketClient.on('userNotOnline', data => {


                var existRecievers = clients.filter((user) => user.userId == data.reciever_id);

                if(existRecievers && existRecievers.length > 0){

                    existRecievers.forEach(function(existReciever){

                        var receiverClient = io.sockets.sockets.get(existReciever.socketId);
                        if(receiverClient){
                            console.log("userNotOnline");
                            receiverClient.emit('userNotOnline', data);
                        }

                    })
                }

               
            });

            // Join a room
           /* let socket = socketClient;
              socket.on('joinRoom', (roomId) => {
                socket.join(roomId);
                if (!rooms[roomId]) {
                  rooms[roomId] = [];
                }
                rooms[roomId].push(socket.id);
                io.to(roomId).emit('userList', rooms[roomId]);
              });

              // Signaling: Exchange offer and answer
              socket.on('offer', (data) => {
                socket.to(data.roomId).emit('offer', data.offer, socket.id);
              });

              socket.on('answer', (data) => {
                socket.to(data.roomId).emit('answer', data.answer, socket.id);
              });

              // Handle disconnect
              socket.on('disconnect', () => {
                for (const roomId in rooms) {
                  const index = rooms[roomId].indexOf(socket.id);
                  if (index !== -1) {
                    rooms[roomId].splice(index, 1);
                    io.to(roomId).emit('userList', rooms[roomId]);
                  }
                }
                console.log('a user disconnected');
              });*/


        });

        

        

    }

   
}

module.exports = SocketController