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
        if(result.length<=0){
            res.send("no user");
            return;
        }
        if(password==result[0].password){
            res.send(result[0]);
            return;
        }
        res.send("password error");
    });
});

app.get("/repassword",function(req,res){
    var oldPassword=req.query.old;
    var newPassword=req.query.new;
    var username=req.query.username;
    if(username==null||oldPassword==null||newPassword==null){
        res.send("parameter error");
        return;
    }
    connection.query("select * from user where name='"+username+"'",function(error,result){
        if(error){
            console.error("sqlerror:"+error);
            res.send("SQL崩了,请找管理员修复<br>"+error)
            return;
        }
        if(result.length<=0){
            res.send("no user");
            return;
        }
        if(oldPassword==result[0].password){
            connection.query("UPDATE user SET password='"+newPassword+"' WHERE name='"+username+"';",function(error1,result1){
                if(error1){
                    console.error("sqlerror:"+error1);
                    return;
                }
                res.send("OK");
            });
            return;
        }
        res.send("password error");
    });
});
app.get("/resetPassword.html",function(req,res){
    res.sendFile(__dirname+"\\resetPassword.html")
})

app.get('/',function(req,res){
    res.sendFile(__dirname+'\\index.html');
});

var msgHistory=[];

io.on("connection",function(socket){
    for(var i=0;i<msgHistory.length;i++){
        socket.emit(msgHistory[i].mode,msgHistory[i].msg);
    }
    socket.on("text message",function(msg){
        //console.log(msg);
        msgHistory.push({msg:msg,mode:"text message"});
        io.emit("text message",msg);
        if(msgHistory.length>=100){
            msgHistory.shift();
        }
    });
    socket.on("html message",function(msg){
        //console.log(msg);
        msgHistory.push({msg:msg,mode:"html message"});
        io.emit("html message",msg);
        if(msgHistory.length>=100){
            msgHistory.shift();
        }
    });
});

server.listen("8081",function(){
    console.log("服务器开启");
});

