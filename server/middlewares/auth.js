import jwt from 'jsonwebtoken'

const userAuth = async (req, resizeBy, next) => {
    const {token} = req.header;


if(!token){
    return resizeBy.json({success: false, message:'Not Authorized. Login Again'});

}

try{
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if(tokenDecode.id){
        req.body.userID = tokenDecode.id;
    }else{
        return resizeBy.json({sucess: false, message: 'Not uthorized. Login Again'});
    }
    next();
} catch (error)
{
   resizeBy.json({success: false, message: error.message});
}
};

export default userAuth;