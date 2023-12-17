import { useState } from "react";

interface RegisterUserModalProps {
  onClose: () => void;
  onRegisterUser: (userData: UserData) => void;
}

interface UserData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  birth_date: string;
}

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({
  onClose,
  onRegisterUser,
}) => {
  const [userData, setUserData] = useState<UserData>({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    birth_date: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <dialog id="register_user_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Register User Modal</h3>
        <form>
          <div className="form-field">
            <label htmlFor="email" className="label">
              <span className="label-text">Email:</span>
            </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="email goes here"
              className="input input-bordered w-full max-w-xm text-black dark:text-white"
              value={userData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-field">
            <label htmlFor="username" className="label">
              <span className="label-text">Username:</span>
            </label>
            <input
              type="text"
              id="username" // Make sure the id matches the htmlFor in the label
              name="username"
              placeholder="username goes here"
              className="input input-bordered w-full max-w-xm text-black dark:text-white"
              value={userData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-field">
            <label className="label">
              <span className="label-text">First Name:</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="First name goes here"
              className="input input-bordered w-full max-w-xm text-black dark:text-white"
              value={userData.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-field">
            <label className="label">
              <span className="label-text">Last Name:</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Last name goes here"
              className="input input-bordered w-full max-w-xm text-black dark:text-white"
              value={userData.last_name}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-field">
            <label className="label">
              <span className="label-text">Birth Date:</span>
            </label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              placeholder="username goes here"
              className="input input-bordered w-full max-w-xm text-black dark:text-white"
              value={userData.birth_date}
              onChange={handleInputChange}
            />
          </div>
        </form>
        <div className="modal-action">
          <button
            name="register_user"
            className="btn glass"
            onClick={() => onRegisterUser(userData)}
          >
            <p>Register User</p>
          </button>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default RegisterUserModal;
