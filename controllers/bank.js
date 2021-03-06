const request = require('request');
const Account = require('./../models/account');
const delay   = require('delay');

const API_KEY = "API-Key ISYJzWWvY155g6AlMIalnaSLDDVeW9LX#jyL7sO6933GEIGcdh8ikvCEVdYdTWgsrx7EJ7U06RVZTVL9hY2KjVeB3Nefny2mV";

exports.signUp = function(body, cb){
  body = JSON.parse(body);
  body.id = body.id;
  body.name = body.first_name + " " + body.last_name;
  body.iban = "SK4402005678901234567893";
  body.bic = "SPSRSKBAKAS";
  console.log(body);
  console.log(body.body);
  console.log(body[0]);
  console.log(body.name);
  console.log(body.iban);
  const userParams = {
      "person":{
        "name":body.name
      }
  }
  //Create USER entity
  request.post({url:"https://play.railsbank.com/v1/customer/endusers", json:userParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
    if(err){
      //res.send(err);
      return;
    }
    const enduser_id = body.enduser_id;
    console.log(body);
    console.log("User ID: "+enduser_id);
    const ledgerParams =
    {
      "holder_id": body.enduser_id,
      "partner_product": "ExampleBank-EUR-1",
      "asset_class": "currency",
      "asset_type": "eur",
      "ledger_type": "ledger-type-single-user",
      "ledger_who_owns_assets": "ledger-assets-owned-by-me",
      "ledger_primary_use_types": ["ledger-primary-use-types-payments","ledger-primary-use-types-deposit"],
      "ledger_t_and_cs_country_of_jurisdiction": "GB"
    }
    delay(10000).then(() => {
      //Create Ledger
      request.post({url:"https://play.railsbank.com/v1/customer/ledgers", json:ledgerParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
        if(err){
          //res.send(err);
          return;
        }
        console.log(body);
        const ledger_id = body.ledger_id
        console.log("Ledger ID: "+ledger_id);
        const IBANParams =
        {
          "iban": body.iban,
          "bic_swift": body.bic
        }
        delay(10000).then(() => {
          //Add IBAN to Ledger
          request.post({url:"https://play.railsbank.com/v1/customer/ledgers/"+body.ledger_id+"/assign-iban", json:IBANParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
            if(err){
              //res.send(err);
              return;
            }
            let newAccount = new Account(
              {
                "facebook_id":body.id,
                "ledger_id": ledger_id,
                "enduser_id": enduser_id
              }
            )
            newAccount.save(function(err, result){
              if(err){
                console.log(err);
                //res.send(400, {"error":"Error saving data. Please try again later..."});
                return;
              }
              cb(null);
              //res.json(201, {"message":"Bank account created"});
            }); //Save
          }); //request
        }); //Delay
      }); //Request
    }); //delay
  }); //request
}


exports.interTransaction = function(req, res){
  const params =
    {
      "ledger_from_id": req.body.from,
      "ledger_to_id": req.body.to,
      "amount": req.body.amount
    };
    request.post({url:"https://play.railsbank.com/v1/customer/transactions/inter-ledger", json:IBANParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
      if(err){
        res.send(err);
        return;
      }
      res.json(201, {"message":"Transaction complete!"});
    });
  }

exports.setDebt = function(req, res){
  const params ={
    "receiver_id":req.body.receiver_id,
    "lender_id":req.body.lender_id,
    "amount":req.body.amount
  };

}

exports.template = function(req, res){
  var body = '<html><body>hello</body></html>';
  res.writeHead(200, {
  'Content-Length': Buffer.byteLength(body),
  'Content-Type': 'text/html'
  });
  res.write(body);
  res.end();
}
