const controller = require('./../controllers/msg.js'),
      Router     = require('restify-router').Router;
      router     = new  Router();


router.get('/',                               controller.get);

module.exports = router;
