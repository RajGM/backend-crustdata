const https = require('https');

function searchPeople(title, company, location) {
  const options = {
    hostname: 'api.example.com',
    port: 443,
    path: `/people?title=${encodeURIComponent(title)}&company=${encodeURIComponent(company)}&location=${encodeURIComponent(location)}`,
    method: 'GET'
  };

  const req = https.request(options, res => {
    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.end()
}