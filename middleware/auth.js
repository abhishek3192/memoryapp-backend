import jwt from 'jsonwebtoken';

//want to like a post
//click the like button => auth middleware(next) => call  like controller

const auth = async (req, res, next) => {
  try {
    // checking if the user is valid or not with token
    const token = req.headers.authorization.split(' ')[1];
    const isCustomAuth = token.length < 500;
    let decodedData;
    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, 'secret');

      req.userId = decodedData?._id;
    } else {
      decodedData = jwt.decode(token);

      req.userId = decodedData?.sub;
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

export default auth;
