import {Button, Result} from "antd";
import {useNavigate} from "react-router-dom";

function AccessDenied() {


    const navigate = useNavigate();
    const handleGoHome = () => {
        navigate('/login');
    };


    return (
        <div className="d-flex justify-content-center align-items-center" style={{height:"80vh"}}>
            <Result

                status="warning"
                title="Accès Refusé"
                subTitle="Désolé, vous n'avez pas l'autorisation d'accéder à cette page."
                extra={
                    <Button type="default" onClick={handleGoHome}>
                        Retour à l accueil
                    </Button>
                }
            />
        </div>

    );
}

export default AccessDenied;