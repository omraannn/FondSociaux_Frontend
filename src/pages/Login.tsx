import { CustomInput } from "../components/index";
import { Link, Navigate } from "react-router-dom";
import {useState, useEffect, ChangeEvent, FormEvent} from "react";
import userService from "../services/userService";
import {openNotificationWithIcon} from "../utils/notificationUtils";
import {jwtDecode} from "jwt-decode";

const Login = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string[]>([]);

    const [errors, setErrors] = useState<any>({});



    useEffect(() => {
        const checkAuthentication = async () => {
            const authenticated = await userService.isAuthenticated();
            const role = await userService.getUserRole();
            if(authenticated) {
                setIsAuthenticated(authenticated);
            }
            setUserRole(role);
        };
        checkAuthentication();
    }, []);


    /*|--------------------------------------------------------------------------
    |  Handle action changes
    |-------------------------------------------------------------------------- */
    const handleEmail = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handlePassword = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);


    /*|--------------------------------------------------------------------------
    |  Handle login functionality
    |-------------------------------------------------------------------------- */
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            const response = await userService.login(formData);
            if (response.status === 'success') {
                openNotificationWithIcon("success", "Succès", "Connexion réussie.");
                resetStates();

                localStorage.setItem("TOKEN", response.token);
                localStorage.setItem("USER_DETAILS", JSON.stringify(response.user));
                localStorage.setItem("PERMISSIONS", JSON.stringify(response.permissions));
                //localStorage.setItem("USER_ROLES", JSON.stringify(response.roles));

                const   decoded: any = jwtDecode(response.token);
                const roles = decoded.roles;


                if (roles.includes('RH')) {
                    setTimeout(() => {
                        window.location.href = "/auth/admin";
                    }, 400);
                } else if (roles.includes('EMPLOYEE')) {
                    setTimeout(() => {
                        window.location.href = "/auth/employee";
                    }, 400);
                } else if (roles.length === 1 && roles.includes('GUEST')) {
                    setTimeout(() => {
                        window.location.href = "/auth/guest";
                    }, 400);
                } else {
                    setTimeout(() => {
                        window.location.href = "/auth/admin";
                    }, 400);
                }
            }
        } catch (error: any) {
            if (error.errors) {
                setErrors(error.errors);
                openNotificationWithIcon("error", "Erreur", "Vos identifiants sont invalides.");
            } else {
                setErrors({ general: error.message || "Une erreur s'est produite lors de la connexion." });
                openNotificationWithIcon("error", "Erreur", "Vos identifiants sont invalides.");
            }
        }
    };


    /*|--------------------------------------------------------------------------
    |  Based on user role redirect it to his dashboard
    |-------------------------------------------------------------------------- */
    if (isAuthenticated) {
        if (userRole.includes('RH')) {
            return <Navigate to="/auth/admin" />;
        } else if (userRole.includes('EMPLOYEE')) {
            return <Navigate to="/auth/employee" />;
        } else if (userRole.includes('GUEST') && userRole.length === 1) {
            console.log(userRole.length)
            return <Navigate to="/auth/guest" />;
        } else {
            return <Navigate to="/auth/admin" />;
        }
    }

    /*|--------------------------------------------------------------------------
    |  Handle reset states
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setEmail("");
        setPassword("");
        setErrors({});
    };

    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div className="login-wrapper">
                <div
                    className="login-wrapper-content bg-white rounded-3 mx-auto p-4 animate__animated animate__zoomInUp">
                    <h3 className="text-center">Connectez-vous</h3>
                    <p className="text-center">Connectez-vous à votre compte pour continuer</p>
                    <form  onSubmit={handleLogin}>
                        <CustomInput
                            I_class_container='mb-3'
                            type="email"
                            label="Adresse Email"
                            I_id="email"
                            action={handleEmail}
                            error={errors.email}
                        />

                        <CustomInput
                            I_class_container='mb-3'
                            label="Mot de passe"
                            I_id="pass"
                            action={handlePassword}
                            value={password}
                            eye={true}
                            error={errors.password}
                        />
                        <div className="mb-3 text-end">
                            <Link className="text-dark" to="/register">Créer un compte?</Link>
                        </div>
                        <button type="submit" className="link w-100">Se connecter</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;