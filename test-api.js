const http = require('http');

const postData = JSON.stringify({
  ingredients: '西红柿、鸡蛋'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/generate-recipe',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => {
    rawData += chunk;
  });
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData);
      console.log('API响应:', parsedData);
    } catch (e) {
      console.error('解析响应失败:', e);
      console.log('原始响应:', rawData);
    }
  });
});

req.on('error', (e) => {
  console.error('请求失败:', e);
});

// 写入数据到请求主体
req.write(postData);
req.end();