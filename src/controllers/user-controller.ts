import UserDTO from "../dtos/user-dto.js";
import Mapper from "../mappers/mapper.js";
import userService from "../services/user-service.js";

class UserController {

    async getUsersByType(req,res,next){
        try{
            const {userType} = req.body;
            const users = await userService.getUsersByType(userType);

            const userDTOs = Mapper.mapUsers(users);

            return res.json({
                items: userDTOs
            });

        }catch(e){
            next(e);
        }

    }

    async getUserById(req,res,next){
        try{
            const {id} = req.body;

            const user = await userService.getUserById(id);

            const userDTO = new UserDTO(user);

            return res.json({
                user: userDTO
            });

        }catch(e){
            next(e)
        }
    }

    async updateUser(req,res,next){
        try{
            const {user} = req.body;

            if(!user){
                return null; // next(AuthError.BadRequest)
            }

            const updatedUser = await userService.updateUser(user);

            const userDTO = new UserDTO(updatedUser);

            return res.json({
                user: UserDTO
            })

        }catch(e){
            next(e)
        }
    }

    async createUser(req,res,next){
        try{
            const {user} = req.body;

            if(!user){
                return null; //next(AuthError.BadRequest)
            }

            const newUser = await userService.createUser(user)

            return res.json({
                id: newUser._id,
                name: newUser.name
            })

        }catch(e){
            next(e)
        }
    }


}



export default new UserController();