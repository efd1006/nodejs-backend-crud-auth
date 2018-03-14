const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try{
    const token = req.headers.authorization.split(" ")[1];
    //console.log(token);
    const verified_token = jwt.verify(token, process.env.JWT_KEY);
    req.userData = verified_token;
    // call next if successfully authenticated
    next();
  } catch(error) {
    return res.status(401).json({message: 'Auth Failed'})
  }
};