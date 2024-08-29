import { assets } from "../assets/images/assets";
import { BsFillTelephoneOutboundFill } from "react-icons/bs";


/*|--------------------------------------------------------------------------
|  this page is a waiting page for pending employees not confirmed yet
|-------------------------------------------------------------------------- */
const WaitingConfirmation = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <div className="text-center mb-4">
                <img src={assets.loading_verification} alt="Chargement" className="rounded rounded-circle loading_verification_animation"/>
            </div>
            <div className="text-center">
                <h3 className="animate__animated animate__fadeIn">Votre compte est créé avec succès.</h3>
                <h4  className="animate__animated animate__fadeIn">Merci de patienter jusqu à ce que l administrateur des ressources humaines vérifie vos informations
                    et confirme votre compte.</h4>
                <p  className="animate__animated animate__fadeIn">Si vous avez des questions ou des problèmes, merci de contacter l administration.</p>

                <a href="tel:28085788" className="link custom--link animate__animated animate__fadeIn">
                    <BsFillTelephoneOutboundFill className="fs-4"/>
                    Contacter l administration
                </a>
            </div>
        </div>
    );
};

export default WaitingConfirmation;