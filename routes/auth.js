const controller = require('./../controllers/auth.js'),
      Router     = require('restify-router').Router,
      router     = new  Router();


router.get('/callback', controller.authenticate, controller.detectMobile, controller.callback);
router.get('/closeWindow', controller.closeWindow);
router.get('/:senderId',              controller.get);

module.exports = router;


