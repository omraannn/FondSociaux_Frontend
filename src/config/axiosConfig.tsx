import axios from "axios";
import {API_URL} from "../utils/env";

/*|--------------------------------------------------------------------------
| Axios instance with 'multipart/form-data' headers
|-------------------------------------------------------------------------- */
export const apiFormData = axios.create({
    baseURL:  API_URL+'/api',
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `bearer ${localStorage.getItem("TOKEN")}`,
    },
});


/*|--------------------------------------------------------------------------
|  Axios instance with 'application/json' headers
|-------------------------------------------------------------------------- */
export const apiJson = axios.create({
    baseURL: API_URL+ '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


/*|--------------------------------------------------------------------------
| Axios instance with 'application/json' headers and Authorization token
|-------------------------------------------------------------------------- */
export const apiAuth = axios.create({
    baseURL: API_URL+ '/api',
    headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${localStorage.getItem("TOKEN")}`,
    },
});


export const updateToken = (token) => {
    apiAuth.defaults.headers['Authorization'] = `bearer ${token}`;
    apiFormData.defaults.headers['Authorization'] = `bearer ${token}`;
    apiJson.defaults.headers['Authorization'] = `bearer ${token}`;
};