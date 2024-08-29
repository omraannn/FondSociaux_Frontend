import {Outlet} from "react-router-dom";
import {Footer, Header} from "../components";

const GuestLayout = () => {
    return (
        <>
            <section className="visitor-layout">
                <Header/>
                <Outlet/>
                <Footer/>
            </section>
        </>
    );
};

export default GuestLayout;