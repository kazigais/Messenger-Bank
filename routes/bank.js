const controller = require('./../controllers/bank.js'),
      Router     = require('restify-router').Router,
      router     = new  Router();


//router.get('/',                               controller.get);
router.post('/account',                         controller.signUp);
// router.get("/template", controller.template);

module.exports = router;
