import { apiAuth } from "../config/axiosConfig";

class policyService {

    /*|--------------------------------------------------------------------------
    | Fetch all Policy without permission
    |-------------------------------------------------------------------------- */
    async getPoliciesAll() {
        try {
            const response = await apiAuth.get('/policies/all');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch policies");
            }
        }
    }

    /*|--------------------------------------------------------------------------
    | Fetch Policy
    |-------------------------------------------------------------------------- */
    async getPolicies(page = 1, pageSize = 10,  filters = {}) {
        try {
            const response = await apiAuth.get('/policies/policies', {
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
                throw new Error("Failed to fetch policies");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Store policy
    |-------------------------------------------------------------------------- */
    async createPolicy(policyData:any) {
        try {
            const response = await apiAuth.post('/policies/store-policy', policyData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to create policy");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Update policy
    |-------------------------------------------------------------------------- */
    async updatePolicy(id:any, policyData:any) {
        try {
            const response = await apiAuth.post(`/policies/update-policy/${id}`, policyData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update policy");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Delete policy
    |-------------------------------------------------------------------------- */
    async deletePolicy(id:any) {
        try {
            const response = await apiAuth.delete(`/policies/delete-policy/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete policy");
            }
        }
    }
}

export default new policyService();
