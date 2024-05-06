class UserDTO {
    constructor(model) {
        this.id = model._id;
        this.name = model.name;
        this.surname = model.surname;
        this.email = model.email;
        this.isActivated = model.isActivated;
        this.birthday = model.birthday;
        this.userType = model.userType;
        this.subscription = model.subscription;
    }
}
export default UserDTO;
