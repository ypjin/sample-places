/**
 * service definition file
 * express 3.0.x doesn't support layout?
 */

logger.setLevel('DEBUG');

ACS.init('OAUTH', 'OAUTH SECRET'); // Please fill me.

var version = "/0.1.0"; // it's for routing, first letter should be slash(/) e.g) /0.1.0

api.index = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + JSON.stringify(err));
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    if(user.session === ""){
      res.render('index', {
        user: user,
        req: req,
        version: version,
        layout: false
      });
    }else{
      res.redirect(version+'/show');
    }
  });
}

api.show = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + JSON.stringify(err));
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    ACS.Places.query({per_page:1000, where:"{\"user_id\":\""+user.user_id+"\"}"}, function(e) {
      if(e.success && e.success === true){
        res.render('show', {
          layout: false,
          list: e,
          user: user,
          res: res,
          req: req,
          version: version
        });
      }else{
        res.text(JSON.stringify(e));
        logger.debug('Error: ' + JSON.stringify(e));
      }
    }, req, res);
  });
}

api.new = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    res.render('new', {
      user: user,
      req: req,
      version: version,
      layout: false
    });
  });
}

api.place = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    var data = {
      place_id: req.params[0]
    };
    ACS.Places.show(data, function(e) {
      if(e.success && e.success === true){
        res.render('place', {
          layout: false,
          user: user,
          req: req,
          version: version,
          place: e
        });
      }else{
        res.redirect(version+'/show?msg='+e.message);
        logger.debug('Error: ' + JSON.stringify(e));
      }
    }, req, res);
  });
};

api.edit = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    var data = {
      place_id: req.params[0]
    };
    ACS.Places.show(data, function(e) {
      if(e.success && e.success === true){
        res.render('edit', {
          layout: false,
          req: req,
          version: version,
          user: user,
          place: e
        });
      }else{
        logger.debug('Error: ' + JSON.stringify(e));
        res.redirect(version+'/show?msg='+e.message);
      }
    }, req, res);
  });
}

api.create = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    if(!req.body.name){
      res.redirect(version+'/show');
    }
    var data = {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code
    };
    ACS.Places.create(data, function(e) {
      if(e.success && e.success === true){
        res.redirect(version+'/show?msg=Successfully created a place.');
      }else{
        logger.debug('Error: ' + JSON.stringify(e));
        res.redirect(version+'/new?msg='+e.message);
      }
    }, req, res);
  });
};

api.update = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    if(!req.body.name){
      res.redirect(version+'/show');
    }
    var data = {
      place_id: req.body.place_id,
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code
    };
    ACS.Places.update(data, function(e) {
      if(e.success && e.success === true){
        res.redirect(version+'/show?msg=Successfully updated a place.');
      }else{
        logger.debug('Error: ' + JSON.stringify(e));
        res.redirect(version+'/edit/'+data.place_id+'?msg='+e.message);
      }
    }, req, res);
  });
};

api.delete = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    var data = {
      place_id: req.params[0]
    };
    ACS.Places.remove(data, function(e) {
      if(e.success && e.success === true){
        res.redirect(version+'/show?msg=Successfully delete a place #'+data.place_id+'.');
      }else{
        logger.debug('Error: ' + JSON.stringify(e));
        res.redirect(version+'/show?msg='+e.message);
      }
    }, req, res);
  });
};

api.login = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    if(user.session === ""){
      ACS.Users.login({
        login: req.body.un,
        password: req.body.pw
      }, function(e) {
        if(e.success && e.success === true){
          res.redirect(version+'/show');
        }else{
          logger.debug('Error: ' + JSON.stringify(e));
          res.redirect(version+'/index?msg='+e.message);
        }
      }, req, res);
    }else{
      res.redirect(version+'/show');
    }
  });
}

api.logout = function(req, res) {
  checkSession(req, res, function(err, user){
    if(err){
      res.text('Error: ' + err);
      logger.debug('Error: ' + JSON.stringify(err));
      return;
    }
    ACS.Users.logout(function(e) {
      if(e.success && e.success === true){
        res.render('index', {
          layout: false,
          req: req,
          version: version,
          e: e,
          user: user
        });
      }else{
        logger.debug('Error: ' + JSON.stringify(e));
        res.redirect(version+'/show?msg='+e.message);  
      }
    }, req, res);
  });
}

function checkSession(req, res, callback){
  var user = {
    session:"",
    name:"",
    user_id:"",
    email:"",
    username:""
  };

  ACS.Users.showMe(function(e){
    if(e.success && e.success === true){
      user.session = e.meta.session_id;
      user.name = e.users[0].first_name + " " + e.users[0].last_name;
      user.user_id = e.users[0].id;
      user.email = e.users[0].email;
      user.username = e.users[0].username;
    }else{
      logger.debug('Error: ' + JSON.stringify(e));
      user.session="";
      user.name="";
      user.user_id="";
      user.email="";
      user.username="";
    }
    callback(null, user);
  }, req, res);
}