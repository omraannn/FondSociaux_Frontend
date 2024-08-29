import { apiAuth } from "../config/axiosConfig";

class roleService {

    /*|--------------------------------------------------------------------------
      | Fetch roles without permissions
      |-------------------------------------------------------------------------- */
    async getRolesAll() {
        try {
            const response = await apiAuth.get('/roles/all');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch roles");
            }
        }
    }

    /*|--------------------------------------------------------------------------
     | Fetch roles
     |-------------------------------------------------------------------------- */
    async getRoles(page = 1, pageSize = 10,  filters = {}) {
        try {
            const response = await apiAuth.get('/roles', {
                params: {
                    page,
                    pageSize,
                    ...filters,
                },
            });
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch roles");
            }
        }
    }

    /*|--------------------------------------------------------------------------
   | Fetch permissions
   |-------------------------------------------------------------------------- */
    async getPermissions() {
        try {
            const response = await apiAuth.get('/roles/permissions');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch permissions");
            }
        }
    }

    /*|--------------------------------------------------------------------------
    | Create a new role
    |-------------------------------------------------------------------------- */
    async createRole(roleData:any) {
        try {
            const response = await apiAuth.post('/roles/store-role', roleData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to create role");
            }
        }
    }

    /*|--------------------------------------------------------------------------
    | Update an existing role
    |-------------------------------------------------------------------------- */
    async updateRole(roleId:any, roleData:any) {
        try {
            const response = await apiAuth.post(`/roles/roles/${roleId}`, roleData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update role");
            }
        }
    }

    /*|--------------------------------------------------------------------------
    | Delete a role
    |-------------------------------------------------------------------------- */
    async deleteRole(roleId:any) {
        try {
            const response = await apiAuth.delete(`/roles/roles/${roleId}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete role");
            }
        }
    }
}

export default new roleService();
