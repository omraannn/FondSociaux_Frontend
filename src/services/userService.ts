import { apiFormData, apiAuth } from '../config/axiosConfig';
import {jwtDecode} from "jwt-decode";

class userService {

    /*|--------------------------------------------------------------------------
    | Register user account
    |-------------------------------------------------------------------------- */
    async register(userData:any) {
        try {
            const response = await apiFormData.post('/register', userData);
            console.log(response)
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Register failed');
            }
        }
    }


    /*|--------------------------------------------------------------------------
   | Store employee
   |-------------------------------------------------------------------------- */
    async storeEmployee(userData:any) {
        try {
            const response = await apiAuth.post('/users/store-employee', userData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Store employee failed');
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Login user account
    |-------------------------------------------------------------------------- */
    async login(credentialsData:any) {
        try {
            const response = await apiFormData.post('/login', credentialsData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Login failed');
            }
        }
    }


   /*|--------------------------------------------------------------------------
   | Refresh JWT token
   |-------------------------------------------------------------------------- */
    async refreshToken() {
        try {
            const response = await apiAuth.post('/refresh-token');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Échec du rafraîchissement du token');
            }
        }
    }

    /*|--------------------------------------------------------------------------
   | Get user Permissions from the Token
   |-------------------------------------------------------------------------- */
    async getUserPermissions() {
        const token = localStorage.getItem('TOKEN');
        if (token) {
            try {
                const decoded:any = jwtDecode(token);
                return decoded.permissions;
            } catch (err) {
                console.error('Failed to decode token:', err);
            }
        }
        return null;
    }

    /*|--------------------------------------------------------------------------
    | Verify if the user is authenticated
    |-------------------------------------------------------------------------- */
    async isAuthenticated() {
        const token = localStorage.getItem('TOKEN');
        return token && !await this.isTokenExpired(token);
    }

    async isTokenExpired(token:any) {
        try {
            const decoded:any = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.log(error)
            return true; // Erreur de décodage ou token invalide
        }
    }


    /*|--------------------------------------------------------------------------
    | Get user Role from the Token
    |-------------------------------------------------------------------------- */
    async getUserRole() {
        const token = localStorage.getItem('TOKEN');
        if (token) {
            try {
                const decoded:any = jwtDecode(token);
                return decoded.roles;
            } catch (err) {
                console.error('Failed to decode token:', err);
            }
        }
        return null;
    }


    /*|--------------------------------------------------------------------------
    | Get user auth ID from TOKEN
    |-------------------------------------------------------------------------- */
    async getUserAuthId() {
        const token = localStorage.getItem('TOKEN');
        if (token) {
            try {
                const decoded:any = jwtDecode(token);
                return decoded.id;
            } catch (err) {
                console.error('Failed to decode token:', err);
            }
        }
        return null;
    }


   /*|--------------------------------------------------------------------------
   | Logout user
   |-------------------------------------------------------------------------- */
    async logout() {
        try {
            const response = await apiAuth.get('/logout');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Update failed');
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | update profile
    |-------------------------------------------------------------------------- */
    async updateProfile (id:any, userData:any) {
        try {
            const response = await apiAuth.post(`/users/update-employee/${id}`, userData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Update failed');
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | update password
    |-------------------------------------------------------------------------- */
    async updatePassword(passwordData:any) {
        try {
            const response = await apiAuth.post('/update-password', passwordData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error('Update to update password');
            }
        }
    }

    /*|--------------------------------------------------------------------------
    |
    |                           Manage employee Section
    |
    |-------------------------------------------------------------------------- */

    /*|--------------------------------------------------------------------------
    | fetch Confirmed employee without permissions
    |-------------------------------------------------------------------------- */
    async getConfirmedEmployeeAll() {
        try {
            const response = await apiAuth.get('/users/confirmed-employee-all');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch confirmed employee");
            }
        }
    }

    /*|--------------------------------------------------------------------------
      | fetch Confirmed employee
      |-------------------------------------------------------------------------- */
    async getConfirmedEmployee(page = 1, pageSize = 10, filters = {}) {
        try {
            const response = await apiAuth.get('/users/confirmed-employee', {
                params: {
                    page,
                    pageSize,
                    ...filters,
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch confirmed employees");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | fetch Pending employee
    |-------------------------------------------------------------------------- */
    async getPendingEmployee() {
        try {
            const response = await apiAuth.get('/users/pending-employee');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch pending employee");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | confirm employee
    |-------------------------------------------------------------------------- */
    async confirmEmployee(id:any) {
        try {
            const response = await apiAuth.post(`/users/confirm-employee/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to confirm employee");
            }
        }
    }


    /*|--------------------------------------------------------------------------
   | Delete employee
   |-------------------------------------------------------------------------- */
    async deleteEmployee(id:any) {
        try {
            const response = await apiAuth.delete(`/users/delete-employee/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete employee");
            }
        }
    }

}
export default new userService();