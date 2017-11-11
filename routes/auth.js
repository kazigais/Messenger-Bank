const controller = require('./../controllers/auth.js'),
      Router     = require('restify-router').Router,
      router     = new  Router();
      const passport = require('passport');


router.get('/:senderId',              controller.get);
router.get('/callback', passport.authenticate('facebook-test'), controller.detectMobile, controller.callback);
router.get('/closeWindow', controller.closeWindow);

module.exports = router;




passport.authenticate('facebook-test')
