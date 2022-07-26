const app =require("express")();
const server =require("http").createServer(app);
const {Server}=require("socket.io");
const io=new Server(server);
const mysql=new require("mysql");
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"******",
    port:3306,
    database:"wechat"
});

connection.connect();

app.get("/login",function(req,res){
    var username=req.query.username;
    var password=req.query.password;
    if(username==null||password==null){
        res.send("parameter error");
        return;
    }
    connection.query("select * from user where name='"+username+"'",function(error,result){
        if(error){
            console.error("sqlerror:"+error);
            return;
        }
        for(var i=0;i<result.length;i++){
            if(password==result[i].password){
                res.send(result[i]);
                return;
            }
        }
        res.send("password error");
    });
});

app.get('/',function(req,res){
    res.sendFile(__dirname+'\\index.html');
});

var msgHistory=[];

io.on("connection",function(socket){
    for(var i=0;i<msgHistory.length;i++){
        socket.emit("text message",msgHistory[i]);
    }
    socket.on("text message",function(msg){
        console.log(msg);
        msgHistory.push(msg);
        io.emit("text message",msg);
        if(msgHistory.length>=100){
            msgHistory.shift();
        }
    });
});

server.listen("8081",function(){
    console.log("服务器开启");
});

