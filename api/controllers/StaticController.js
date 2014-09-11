module.exports = {

  dashboard: function(req, res) {
    return res.view('dashboard', {
      scope: {
        user: req.session.user
      }
    });
  }

};
