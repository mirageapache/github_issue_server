const express = require('express');
const axios = require('axios');
const fetch = (...args) =>
  import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const body_parser = require('body-parser');
const { response } = require('express');

// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

let app = express();
app.use(cors());
app.use(body_parser.json());

// Get user access_token - (取得access token)
app.get('/getAccessToken', async function (req, res) {
  try {
    const params = `client_id=${client_id}&client_secret=${client_secret}&code=${req.query.code}`;
    await fetch(`https://github.com/login/oauth/access_token?${params}`,{
      method: 'POST',
      headers: {
        "Accept": "application/json"
      }
    }).then((response) => {
      return response.json();
    }).then((data)=>{
      res.json(data);
    })
  } catch (error) {
    console.log(error)
  }
});

// Get user data - (取得使用者資料)
app.get('/getUserData', async function (req, res) {
  await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      "Authorization": req.get("Authorization")
    }
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Get all issue list - (取得所有issues清單)
app.get('/getIssueList', async function (req, res) {
  const params = req.query.q
  const page = req.query.page;
  const per_page = 10;
  await fetch(`https://api.github.com/search/issues?q=${params}&page=${page}&per_page=${per_page}`, {
    method: "GET",
    headers: {
      "Authorization": req.get("Authorization")
    },
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Get Search issue list - (取得搜尋條件的issues清單)
app.get('/getSearchList', async function (req, res) {
  const params = req.query.q;
  const sort = req.query.sort;
 
  let order = '';
  if(req.query.sort === 'true'){
    order = 'desc';
  }
  else{
    order = 'asc';
  }
  await fetch(`https://api.github.com/search/issues?q=${params}&sort=created&order=${order}`, {
    method: "GET",
    headers: {
      "Authorization": req.get("Authorization")
    }
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Get single issue - (取得單一則issue資料)
app.get('/getDetail', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const number = req.query.number;

  await fetch(`https://api.github.com/repos/${username}/${repo}/issues/${number}`, {
    method: "GET",
    headers: {
      "Authorization": req.get("Authorization")
    }
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Create issue - (建立issue)
app.get('/createIssue', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const title = req.query.title;
  const body = req.query.body;
  const raw = JSON.stringify({"title": title, "body": body})

  await fetch(`https://api.github.com/repos/${username}/${repo}/issues`, {
    method: "POST",
    headers: {
      "Authorization": req.get("Authorization")
    },
    body: raw
  }).then(response => {    
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Edit issue - (編輯issue)
app.get('/editIssue', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const number = req.query.number;
  const title = req.query.title;
  const body = req.query.body;
  const raw = JSON.stringify({"title": title, "body": body})

  await fetch(`https://api.github.com/repos/${username}/${repo}/issues/${number}`, {
    method: "PATCH",
    headers: {
      "Authorization": req.get("Authorization")
    },
    body: raw
  }).then(response => {    
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Close issue - (刪除issue)
app.get('/deleteIssue', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const number = req.query.number;
  const raw = JSON.stringify({"state": "closed"});

  await fetch(`https://api.github.com/repos/${username}/${repo}/issues/${number}`, {
    method: "POST",
    headers: {
      "Authorization": req.get("Authorization")
    },
    body: raw
  }).then(response => {    
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Create label - (建立labels)
app.get('/createLabels', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const label_name = req.query.label_name;
  const raw = JSON.stringify({"name": label_name})

  await fetch(`https://api.github.com/repos/${username}/${repo}/labels`, {
    method: "POST",
    headers: {
      "Authorization": req.get("Authorization")
    },
    body: raw
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Add label to issue - (在issue新增label)
app.get('/addLabelsToIssue', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const number = req.query.number;
  const raw = JSON.stringify({"labels": ["open"]});

  await fetch(`https://api.github.com/repos/${username}/${repo}/issues/${number}/labels`, {
    method: "POST",
    headers: {
      "Authorization": req.get("Authorization")
    },
    body: raw
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// set label to issue - (在issue 設定label)
app.get('/setLabelsToIssue', async function (req, res) {
  const username = req.query.username;
  const repo = req.query.repo;
  const number = req.query.number;
  const label = req.query.label.toLowerCase();
  const raw = JSON.stringify({"labels":[label]});
  
  await fetch(`https://api.github.com/repos/${username}/${repo}/issues/${number}/labels`, {
    method: "PUT",
    headers: {
      "Authorization": req.get("Authorization")
    },
    body: raw
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});

// Get repo list - (取得repo清單)
app.get('/getRepoList', async function (req, res) {
  await fetch(`https://api.github.com/user/repos`, {
    method: "GET",
    headers: {
      "Authorization": req.get("Authorization")
    }
  }).then(response => {
    return response.json();
  }).then(data => {
    res.json(data);
  }); 
});



// Server 監聽
app.listen(5000, function(){
  console.log('express server is online!')
});