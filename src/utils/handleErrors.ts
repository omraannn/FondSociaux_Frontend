import {openNotificationWithIcon} from "./notificationUtils";


/*|--------------------------------------------------------------------------
|  Handle error messages
|-------------------------------------------------------------------------- */
export const handleError = (error:any, setErrors:any) => {
    if (error.errors) {
        setErrors(error.errors);
    } else {
        setErrors({ general: error.message || "Un problème est survenu." });
    }
    openNotificationWithIcon('error', "Erreur", error.message);
};