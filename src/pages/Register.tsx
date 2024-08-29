import { Button, Form, Upload } from "antd";
import CustomInput from "../components/CustomInput.jsx";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import userService from "../services/userService";
import {openNotificationWithIcon} from "../utils/notificationUtils";



const Register = () => {

    const [frontImageFileList, setFrontImageFileList] = useState<any>([]);
    const [backImageFileList, setBackImageFileList] = useState<any>([]);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [cin, setCin] = useState('');
    const [tel, setTel] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const [errors, setErrors] = useState<any>({});
    const history = useNavigate();


    /*|--------------------------------------------------------------------------
    |  Handle action changes
    |-------------------------------------------------------------------------- */
    const handleFirstname = (e:any) => setFirstname(e.target.value);
    const handleLastname = (e:any) => setLastname(e.target.value);
    const handleAge = (e:any) => setAge(e.target.value);
    const handleAddress = (e:any) => setAddress(e.target.value);
    const handleCin = (e:any) => setCin(e.target.value);
    const handleEmail = (e:any) => setEmail(e.target.value);
    const handlePassword = (e:any) => setPassword(e.target.value);
    const handleTel = (e:any) => setTel(e.target.value);
    const handleBeforeUpload = () => {
        openNotificationWithIcon("info", "Conseil", "Merci d'assurer que l'image de votre CIN est bien claire.");
        return false;
    };


    /*|--------------------------------------------------------------------------
    |  Handle register functionality
    |-------------------------------------------------------------------------- */
    const handleRegister = async (e:any) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('front_image', frontImageFileList[0]?.originFileObj);
        formData.append('back_image', backImageFileList[0]?.originFileObj);
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('age', age);
        formData.append('address', address);
        formData.append('cin', cin);
        formData.append('tel', tel);
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await userService.register(formData);
            console.log(response)
            if (response.status === 'success') {
                openNotificationWithIcon("success", "Succès", "Inscription réussie.");
                resetStates();
                setTimeout(()=> {
                    history("/login");
                }, 500);
            }
        } catch (error:any) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ general: error.message || "Une erreur s'est produite lors de l'inscription." });
            }
            openNotificationWithIcon("error", "Erreur", "Veuillez vérifier vos informations.");
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle reset states
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setFrontImageFileList([]);
        setBackImageFileList([]);
        setLastname("");
        setFirstname("");
        setAge("");
        setAddress("");
        setEmail("");
        setCin("");
        setTel("");
        setPassword("");
        setErrors({})
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div>
                <div className="py-sm-2 py-lg-5 register-wrapper">
                    <div className="register-wrapper-content bg-white rounded-3 mx-auto p-4 animate__animated animate__zoomInUp">
                        <h3 className="text-center">Créer un compte</h3>
                        <p className="text-center">
                            <Link className="text-dark" to="/login">Connectez-vous</Link>
                            à votre compte pour continuer</p>
                        <Form>
                            <div className="row">
                                <CustomInput
                                    I_class_container="mb-3 col-md-6"
                                    type="text"
                                    label="Nom"
                                    name="firstname"
                                    value={firstname}
                                    action={handleFirstname}
                                    error={errors.firstname}
                                />
                                <CustomInput
                                    I_class_container="mb-3 col-md-6"
                                    type="text"
                                    label="Prénom"
                                    name="lastname"
                                    value={lastname}
                                    action={handleLastname}
                                    error={errors.lastname}
                                />
                            </div>

                            <div className="row">
                                <CustomInput
                                    I_class_container="mb-3 col-md-6"
                                    type="number"
                                    label="Âge"
                                    name="age"
                                    value={age}
                                    action={handleAge}
                                    error={errors.age}
                                />

                                <CustomInput
                                    I_class_container="mb-3 col-md-6"
                                    type="number"
                                    label="CIN"
                                    name="cin"
                                    value={cin}
                                    action={handleCin}
                                    error={errors.cin}
                                />
                            </div>

                            <div className="row">
                                <CustomInput
                                    I_class_container="mb-3 col-md-6"
                                    type="number"
                                    label="Téléphone"
                                    name="tel"
                                    value={tel}
                                    action={handleTel}
                                    error={errors.tel}
                                />

                                <CustomInput
                                    I_class_container="mb-3 col-md-6"
                                    type="text"
                                    label="Adresse"
                                    name="address"
                                    value={address}
                                    action={handleAddress}
                                    error={errors.address}
                                />
                            </div>

                            <CustomInput
                                I_class_container="mb-3"
                                type="email"
                                label="Email"
                                name="email"
                                value={email}
                                action={handleEmail}
                                error={errors.email}
                            />

                            <CustomInput
                                I_class_container="mb-3"
                                label="Mot de passe"
                                name="password"
                                value={password}
                                eye={true}
                                action={handlePassword}
                                error={errors.password}
                            />


                            <div className="row mb-3">
                                <Upload
                                    listType="picture"
                                    beforeUpload={handleBeforeUpload}
                                    maxCount={1}
                                    fileList={frontImageFileList}
                                    onChange={({fileList}) => setFrontImageFileList(fileList)}
                                >
                                    <Button icon={<UploadOutlined/>}>Télécharger le recto CIN</Button>
                                </Upload>
                                {errors.front_image && <div className="px-3 text-danger">{errors.front_image}</div>}
                            </div>

                            <div className="row mb-3">
                                <Upload
                                    listType="picture"
                                    beforeUpload={handleBeforeUpload}
                                    maxCount={1}
                                    fileList={backImageFileList}
                                    onChange={({fileList}) => setBackImageFileList(fileList)}
                                >
                                    <Button icon={<UploadOutlined/>}>Télécharger le verso CIN</Button>
                                </Upload>
                                {errors.back_image && <div className="px-3 text-danger">{errors.back_image}</div>}
                            </div>

                            <Form.Item>
                                <button onClick={handleRegister} type="submit" className="link w-100">
                                    S inscrire
                                </button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;