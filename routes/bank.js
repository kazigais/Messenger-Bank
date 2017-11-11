const controller = require('./../controllers/bank.js'),
      Router     = require('restify-router').Router,
      router     = new  Router();


//router.get('/',                               controller.get);
router.post('/account',                         controller.signUp);

module.exports = router;
