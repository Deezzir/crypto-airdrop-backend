import UserDTO from "../dtos/user-dto.js";
import Mapper from "../mappers/mapper.js";
import userService from "../services/user-service.js";

class UserController {
  //TODO ???
  //UPDATE USER IF REGISTERED AND TWITTER LINK IS DIFFERENT

  async addUpdateUser(req, res, next) {
    try {
      const { user } = req.body;

      console.log("user = ", user);
      return res.json({});

      if (!user) {
        return null; //next(AuthError.BadRequest)
      }

      const newUser = await userService.createUser(user);

      return res.json({
        id: newUser._id,
        name: newUser.name,
      });
    } catch (e) {
      next(e);
    }
  }

  async checkUserByWallet(req, res, next) {
    try {
      const { wallet } = req.body;

      console.log("wallet = ", wallet);
      return res.json({});

      const user = await userService.getUsersByWallet(wallet);

      if (!user) {
        // NO USER FOUND
      }

      //ADD VALIDATION CHECK FOR:
      // TG
      // TWITTER
      // TWITTER POST
      return res.json({
        validated: true,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
