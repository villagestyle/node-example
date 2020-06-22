import express from "express";
import mongo from "../until/connectSQL";
import jwt from "jsonwebtoken";
import { AssessTokenKey } from "../config/index";
import { ObjectId } from "mongodb";

var router = express.Router();

router.get("/", (req, res) => {
  console.log("[index]", "hellow world");
  res.send("hello world");
});

router.get("/info", (req, res) => {
  const result = req.query as {
    id: string;
  };
  mongo
    .collection("user")
    .findOne({
      _id: new ObjectId(result.id)
    })
    .then(ret => {
      if (ret) {
        res.status(200).json(ret);
      } else {
        res.status(500).json({ errmsg: "未找到该用户" });
      }
    });
});

router.post("/register", (req, res) => {
  const result = req.body as {
    username: string;
    password: string;
  };
  let errmsg = "";
  if (result.username.length < 6) {
    errmsg = "用户名至少需要六个字符";
  }
  if (result.password.length < 6) {
    errmsg = "密码至少需要六个字符";
  }
  if (errmsg) {
    res.status(500).json({ errmsg });
  }
  /** 判断是否已存在 */
  mongo.createCollection("user").then(async ret => {
    const exist = await ret.findOne({
      username: result.username
    });
    if (exist) {
      res.status(500).json({ errmsg: "该用户名已存在" });
      return;
    }
    ret.insertOne({
      username: result.username,
      password: result.password
    });
    res.status(200).send();
    console.log("insertOne");
  });
});

router.post("/login", (req, res) => {
  const result = req.body as {
    username: string;
    password: string;
  };
  let errmsg = "";
  if (result.username.length < 6) {
    errmsg = "用户名至少需要六个字符";
  }
  if (result.password.length < 6) {
    errmsg = "密码至少需要六个字符";
  }
  if (errmsg) {
    res.status(500).json({ errmsg });
    return;
  }
  /** 判断是否已存在 */
  mongo.createCollection("user").then(async ret => {
    const exist = await ret.findOne({
      username: result.username,
      password: result.password
    });
    if (exist) {
      const token = jwt.sign(exist, AssessTokenKey, {
        expiresIn: "5d",
        issuer: "villageStyle"
      });
      res.status(200).json({
        ...exist,
        token
      });
      return;
    } else {
      res.status(500).json({ errmsg: "未找到该用户" });
    }
  });
});

router.post("/page", async (req, res) => {
  const result = req.body as {
    rows: number;
    pageNum: number;
  };
  if (!result.rows || !result.pageNum) {
    res.status(500).json({ errmsg: "rows/pageNum不能为空" });
    return;
  }
  const total = await mongo.collection("user").count();
  mongo
    .collection("user")
    .find()
    .skip((result.pageNum - 1) * result.rows)
    .limit(result.pageNum * result.rows)
    .toArray()
    .then(ret => {
      const data = {
        ...result,
        record: ret,
        total
      };
      res.status(200).json(data);
    });
});

router.delete("/delete", (req, res) => {
  const result = req.query as {
    id: string;
  };
  console.log("删除用户", req.query);
  mongo
    .collection("user")
    .remove({
      _id: new ObjectId(result.id)
    })
    .then(ret => {
      console.log(ret.result);
      res.status(200).send();
    });
});

router.put("/:id", (req, res) => {
  const result = req.body as {
    username: string;
    password: string;
  };
  const id = req.path.slice(1);
  let errmsg = "";
  if (result.username.length < 6) {
    errmsg = "用户名至少需要六个字符";
  }
  if (result.password.length < 6) {
    errmsg = "密码至少需要六个字符";
  }
  if (errmsg) {
    res.status(500).json({ errmsg });
  }
  mongo.createCollection("user").then(async ret => {
    const data = await ret
      .find({
        username: result.username,
        _id: { $ne: new ObjectId(id) }
      })
      .toArray();
    console.log(data);
    if (data.length) {
      res.status(500).json({ errmsg: "该用户名已存在" });
      return;
    }
    ret
      .updateOne(
        {
          _id: new ObjectId(id)
        },
        { $set: result }
      )
      .then(ret => {
        res.status(200).send();
        console.log("updateOne");
      });
  });
});

export default router;
