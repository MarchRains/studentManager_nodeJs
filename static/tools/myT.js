//把链接数据库和增删查改操作单独封装成一个myT的工具包JS文件然后暴露到全局环境
// 需要使用的时候就可以直接调用
//封装数据库的操纵逻辑
const MongoClient = require('mongodb').MongoClient;

//数据库地址
//localhost 虽然是本机 最终还是要对应一个IP地址
const url = 'mongodb://127.0.0.1:27017';

//指定链接的数据库名字
const dbName = 'SZHMQD';

//使用module.exports把封装的语句暴露出去
module.exports = {
    //es6的快速赋值
    //发送信息 并且跳转的功能
    mess(response, mess, url) {
        //
        response.setHeader('content-type', 'text/html');
        response.send(`<script>alert("${mess}");window.location.href="${url}"</script>`);
    },
    //提供查询的方法
    //查询
    find(collectionName, query, callback) {
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            //使用某个库
            const db = client.db(dbName);
            //查询逻辑
            db.collection(collectionName).find(query).toArray((err, docs) => {
                client.close();
                // 把err,和查询到的信息返回
                callback(err, docs);
            })
        });
    },
    //新增
    insert(collectionName, doc, callback) {
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            //使用某个库
            const db = client.db(dbName);
            //查询逻辑
            db.collection(collectionName).insertOne(doc, (err, result) => {
                client.close();
                //传递出去
                callback(err,result);
            })
        });
    },
    //删除
    delete(collectionName, query, callback) {
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            //使用某个库
            const db = client.db(dbName);
            //查询逻辑
            db.collection(collectionName).deleteOne(query,(err,result)=>{
                client.close();
                // 回调函数返回信息
                callback(err,result);
            })
        });
    },
    //修改
    delete(collectionName, query,doc, callback) {
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            //使用某个库
            const db = client.db(dbName);
            //查询逻辑
            db.collection(collectionName).updateOne(query,{
                $set:doc
            },(err,result)=>{
                client.close();
                callback(err,result);
            })
        });
    }
}