import SubscriptionDTO from "../dtos/subscription-dto.js";
import UserDTO from "../dtos/user-dto.js";

class Mapper{ 
    public static mapUsers(users){
        return users.map(user=>new UserDTO(user))
    }

    public static mapSubscriptions(subs){
        return subs.map(sub=> new SubscriptionDTO(sub));
    }
}

export default Mapper;