import {assets} from "../assets/images/assets";
import {Link} from "react-router-dom";


/*|--------------------------------------------------------------------------
|  Header for GUEST layout
|-------------------------------------------------------------------------- */
const Header = () => {
    return (
        <>
            <header className="site-header">
                <div className="header-shape header-shape-1">
                    <svg width="337" height="222" viewBox="0 0 337 222" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient x1="50%" y1="55.434%" x2="50%" y2="0%" id="header-shape-1">
                                <stop stopColor="#E0E1FE" stopOpacity="0" offset="0%"/>
                                <stop stopColor="#E0E1FE" offset="100%"/>
                            </linearGradient>
                        </defs>
                        <path d="M1103.21 0H1440v400h-400c145.927-118.557 166.997-251.89 63.21-400z"
                              transform="translate(-1103)" fill="url(#header-shape-1)" fillRule="evenodd"/>
                    </svg>
                </div>
                <div className="header-shape header-shape-2">
                    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"
                         style={{overflow : "visible"}}>
                        <defs>
                            <linearGradient x1="93.05%" y1="19.767%" x2="15.034%" y2="85.765%" id="header-shape-2">
                                <stop stopColor="#FF3058" offset="0%"/>
                                <stop stopColor="#FF6381" offset="100%"/>
                            </linearGradient>
                        </defs>
                        <circle className="anime-element fadeup-animation" cx="64" cy="64" r="64"
                                fill="url(#header-shape-2)" fillRule="evenodd"/>
                    </svg>
                </div>
                <div className="container">
                    <div className="site-header-inner">
                        <div className="brand header-brand">
                            <h1 className="mb-3">
                                <Link to='/'>
                                    <img src={assets.logo} alt="logo"/>
                                </Link>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};
export default Header;