//导入模块
let express = require('express');
//svg-captcha验证码
let svgCaptcha = require('svg-captcha');
//path路径模块
let path = require('path');
//倒入session模块
let session = require('express-session');
//倒入body-parser 格式化表单的数据
let bodyParser = require('body-parser');
//使用自己抽取的工具函数
let myT = require(path.join(__dirname,'static/tools/myT'));
//导入自己的首页路由
let indexRoute = require(path.join(__dirname,'route/indexRoute'));


//创建APP
let app = express();

//设置托管静态资源
app.use(express.static('static'));
//使用session中间件
//每个路由器 req对象中 增加 session这个属性
//每个路由中 多了一个 可以访问到的session属性 可以在他身上 保存 要共享的属性
// 比如获取的密码 验证码等等

// express验证
app.use(session({
    secret:'keyboard cat 21'
}))

//使用bodyparser中间件 
app.use(bodyParser.urlencoded({
    // 必填的参数
    extended:false
}))

// 路由-----------------
//路由1:功能
// 使用get(app.get)方法登录页面的时候  直接读取登录页 并返回 res.sendFile(拼接到登录页的路径)
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'/static/views/login.html'));  
})

//路由2
//使用post 提交数据过来 验证用户登录
app.post('/login',(req,res)=>{
    //获取form表单提交的数据
    //接收数据
    //比较数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    //验证码
    let code = req.body.code;
    //跟session中的验证码进行比较
    if(code == req.session.captcha){
        console.log('验证码正确');
        req.session.userInfo = {
            userName,
            userPass
        }
        //正确直接跳转进入首页
        res.redirect('/index');
    }else{
        // 错误弹出验证码错误,并返回登录页
        // console.log('验证码错误');
       myT.mess(res, '验证码错误', '/login');
    }
})

//路由3
//生成图片的功能
//把这个地址 设置给 登录页 图片的src属性
app.get('/login/captchaImg',(req,res)=>{
    //生成一张图片 并返回
    var captcha = svgCaptcha.create();

    //打印验证码
    console.log(captcha.text);
    //获取session的值
    // console.log(req.session.userInfo);
    //保存验证码的值 到session方便后续的使用
    //为了验证的时候比较简单 统一转为小写
    req.session.captcha = captcha.text.toLocaleLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
    
})

//路由4
//访问首页 index
app.get('/index',(req,res)=>{
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,'static/views/index.html'));
    }else{
        //没有session去登录页
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请登录");window.location.href="/login"</script>')
    }
})

//路由5
//登出操作
//删除session的值即可
app.get('/logout',(req,res)=>{
    //删除session中的userInfo
    delete req.session.userInfo;

    res.redirect('/login');
})

//路由6
//展示注册页面
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname, 'static/views/register.html'));
})

//路由7
//判断数据库
app.post('/register',(req,res)=>{
    //获取用户数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    console.log(userName);
    myT.find('userList',{
        userName
    },(err,docs)=>{
        // 如果查询结果返回的长度等于0,说明用户名没有重复
        //可以注册
        if(docs.length==0){
            myT.insert('userList', {
                userName,
                userPass
            },(err,result)=>{
                if(!err){
                    myT.mess(res,'恭喜您注册成功','/login');
                }
            })
        }else{
            myT.mess(res,'用户名或密码存在,请重新输入','/register');
        }
    })
})


//监听
app.listen(80,'127.0.0.1',()=>console.log('开始监听'));
