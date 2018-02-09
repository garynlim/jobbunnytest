var request = require('request');

var bot_id = '5948b2f9e4b071237743c49b'; // jobbunny bot id in chatfuel
var block_id = '5a61894ae4b0b3fa51909576'; // response block in chatfuel
var token = 'vnbqX6cpvXUXFcOKr5RHJ7psSpHDRzO1hXBY8dkvn50ZkZyWML3YdtoCnKH7FSjC'; // jobbunny bot token in chatfuel

module.exports = function(data) {
    var user_id = data['userId'];
    console.log('user:' + user_id);
    var options = {
        url: 'https://api.chatfuel.com/bots/' + bot_id + '/users/' + user_id + '/send?chatfuel_token=' + token + '&chatfuel_block_id=' + block_id + 
        '&company=' + data['companyName'] +
        '&jobDescription=' + data['description'],
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    function callback(error, response, body) {
        if (error) {return console.log(response); }
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            console.log(info);
        }
    }

    request.post(options, callback);
}
