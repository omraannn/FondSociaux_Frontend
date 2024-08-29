import {Link} from "react-router-dom";
import {assets} from "../assets/images/assets";

const NotFound = () => {
    return (
        <div className="not-found d-flex flex-column align-items-center justify-content-center position-relative">
            <img width={400} src={assets.notFound}
                 alt="404"/>
            <h2 className="position-absolute">Page non trouvée</h2>
            <p className="position-absolute"> La page que vous recherchez n existe pas.</p>
            <Link className="position-absolute link custom--link" to="/">Revenir à la page d accueil</Link>
        </div>
    );
};

export default NotFound;