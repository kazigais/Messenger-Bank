const request = require('request');
const Account = require('./../models/account');
const delay   = require('delay');

const API_KEY = "API-Key ISYJzWWvY155g6AlMIalnaSLDDVeW9LX#jyL7sO6933GEIGcdh8ikvCEVdYdTWgsrx7EJ7U06RVZTVL9hY2KjVeB3Nefny2mV";

exports.signUp = function(req, res){
  console.log(req.body.name);
  console.log(req.body.email);
  console.log(req.body.iban);
  console.log(req.body.bic);
  const userParams = {
      "person":{
        "name":req.body.name,
        "email":req.body.email
      }
  }
  //Create USER entity
  request.post({url:"https://play.railsbank.com/v1/customer/endusers", json:userParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
    if(err){
      res.send(err);
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
          res.send(err);
          return;
        }
        console.log(body);
        const ledger_id = body.ledger_id
        console.log("Ledger ID: "+ledger_id);
        const IBANParams =
        {
          "iban": req.body.iban,
          "bic_swift": req.body.bic
        }
        delay(10000).then(() => {
          //Add IBAN to Ledger
          request.post({url:"https://play.railsbank.com/v1/customer/ledgers/"+body.ledger_id+"/assign-iban", json:IBANParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
            if(err){
              res.send(err);
              return;
            }
            newAccount = new Account(
              {
                "facebook_id":req.body.facebook_id,
                "ledger_id": ledger_id,
                "enduser_id": enduser_id
              }
            )
            newAccount.save(function(err, result){
              if(err){
                console.log(err);
                res.send(400, {"error":"Error saving data. Please try again later..."});
                return;
              }
              res.json(201, {"message":"Bank account created"});
            });
          });
        });
      });
    });
  });
}


// export.interTransaction = function(req, res){
//   const params =
//     {
//       "ledger_from_id": req.body.from,
//       "ledger_to_id": req.body.to,
//       "amount": req.body.amount
//     };
//     request.post({url:"https://play.railsbank.com/v1/customer/transactions/inter-ledger", json:IBANParams, headers:{"Content-Type":"application/json", "Authorization":API_KEY}}, function(err,httpResponse,body){
//       if(err){
//         res.send(err);
//         return;
//       }
//       res.json(201, {"message":"Transaction complete!"});
//     });
//   }
