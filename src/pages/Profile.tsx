import { CustomInput } from "../components/index";
import { Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";
import { openNotificationWithIcon } from "../utils/notificationUtils";
import { useState } from "react";
import {handleError} from "../utils/handleErrors";



const Profile = () => {

    const history = useNavigate();
    const user = JSON.parse(localStorage.getItem("USER_DETAILS") || '');


    const [firstname, setFirstname] = useState(user.firstname)
    const [lastname, setLastname] = useState(user.lastname)
    const [email, setEmail] = useState(user.email)
    const [age, setAge] = useState(user.age)
    const [address, setAddress] = useState(user.address)
    const [tel, setTel] = useState(user.tel)
    const [id] = useState(user.id)


    const [errors, setErrors] = useState<any>({})


    const [currentPassword, setCurrentPassword] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')


    /*|--------------------------------------------------------------------------
    |  Handle action changes
    |-------------------------------------------------------------------------- */
    const handleFirstname = (e:any) => setFirstname(e.target.value);
    const handleLastname = (e:any) => setLastname(e.target.value);
    const handleEmail = (e:any) => setEmail(e.target.value);
    const handleAge = (e:any) => setAge(e.target.value);
    const handleAddress = (e:any) => setAddress(e.target.value);
    const handleTel = (e:any) => setTel(e.target.value);
    const handleCurrentPassword = (e:any) => setCurrentPassword(e.target.value);
    const handleNewPassword = (e:any) => setNewPassword(e.target.value);
    const handleConfirmPassword = (e:any) => setConfirmPassword(e.target.value);


    /*|--------------------------------------------------------------------------
    |  Handle update profile data
    |-------------------------------------------------------------------------- */
    const handleUpdateProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('firstname', firstname);
            formData.append('lastname', lastname);
            formData.append('email', email);
            formData.append('age', age);
            formData.append('address', address);
            formData.append('tel', tel);
            const response = await userService.updateProfile(id, formData);
            localStorage.setItem('USER_DETAILS', JSON.stringify(response.user));
            openNotificationWithIcon("success", "Succès", "Profil mis à jour avec succès.");
            setErrors({});
        } catch (error) {
           handleError(error,setErrors)
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle update password
    |-------------------------------------------------------------------------- */
    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setErrors({ confirm_password: "Le nouveau mot de passe et la confirmation ne correspondent pas." });
            return;
        }
        try {
            const formData = new FormData();
            formData.append("current_password", currentPassword);
            formData.append("new_password", newPassword);
            await userService.updatePassword(formData);
            resetStates();
            openNotificationWithIcon("success", "Succès", "Mot de passe mis à jour avec succès.");
        } catch (error) {
            handleError(error, setErrors)
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle logout functionality
    |-------------------------------------------------------------------------- */
    const handleLogout = async () => {
        try {
            const response = await userService.logout();
            if (response.status === "success") {
                localStorage.removeItem('TOKEN');
                localStorage.removeItem('USER_DETAILS');
                localStorage.removeItem('USER_ROLES');
                openNotificationWithIcon("success", "Succès", "Déconnexion réussie.");

                setTimeout(() => {
                    history("/");
                }, 400);
            }
        } catch (error) {
            handleError(error, setErrors)
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle reset states
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({})
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div className="profile">
                <h3 className="mb-4 bg-white p-4 w-100">Paramètres de profil</h3>
                <div className="rounded bg-white mb-3">
                    <div className="row">
                        <div className="col-md-3 border-right">
                            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                                <div className="mt-1">
                                    <Space wrap size={16}>
                                        <Avatar size={100} shape="square" icon={<UserOutlined/>}/>
                                    </Space>
                                </div>
                                <span className="font-weight-bold">{firstname} {lastname}</span>
                                <span className="text-black-50">{email}</span>
                                <span></span>
                            </div>
                        </div>
                        <div className="col-md-5 border-right">
                            <div className="p-3 py-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="text-right">Paramètres de profil</h4>
                                </div>

                                <div className="row mt-2">
                                    <CustomInput type='text' label="Nom" I_id="nom"
                                                 I_class_container="col-md-6 profile_custom_input" value={firstname}
                                                 action={handleFirstname} error={errors.firstname}/>
                                    <CustomInput type='text' label="Prénom" I_id="prenom" I_class_container="col-md-6"
                                                 value={lastname} action={handleLastname} error={errors.lastname}/>
                                </div>

                                <div className="row mt-3">
                                    <CustomInput type="email" label="Email" I_id="email"
                                                 I_class_container="col-md-12 mb-3"
                                                 value={email} action={handleEmail} error={errors.email}/>
                                    <CustomInput type="age" label="Age" I_id="age" I_class_container="col-md-12 mb-3"
                                                 value={age} action={handleAge} error={errors.age}/>
                                    <CustomInput type="text" label="Adresse" I_id="adresse"
                                                 I_class_container="col-md-12 mb-3" value={address}
                                                 action={handleAddress}
                                                 error={errors.address}/>
                                    <CustomInput type="number" label="telephone" I_id="tel"
                                                 I_class_container="col-md-12 mb-3" value={tel} action={handleTel}
                                                 error={errors.tel}/>
                                </div>

                                <div className="text-center">
                                    <button onClick={handleUpdateProfile} className="link w-100 profile-button"
                                            type="button">Enregistrer le profil
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="p-3 py-5">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Changer le mot de passe</span>
                                    <button onClick={handleLogout} className="border px-3 p-1 signout-btn">
                                        <i className="fa fa-plus"></i>Se déconnecter
                                    </button>
                                </div>
                                <CustomInput eye={true} label="Mot de passe actuel" I_id="experienceDesigning"
                                             I_class_container="col-md-12 mt-3 mb-3" value={currentPassword}
                                             action={handleCurrentPassword} error={errors.current_password}/>
                                <CustomInput eye={true} label="nouveau mot de passe" I_id="additionalDetails"
                                             I_class_container="col-md-12 mb-3" value={newPassword}
                                             action={handleNewPassword} error={errors.new_password}/>
                                <CustomInput eye={true} label="confirmer mot de passe" I_id="additionalDetails2"
                                             I_class_container="col-md-12 mb-3" value={confirmPassword}
                                             action={handleConfirmPassword} error={errors.confirm_password}/>
                                <div className="text-center">
                                    <button onClick={handleUpdatePassword} className="link w-100 profile-button"
                                            type="button">Changer mot de passe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;