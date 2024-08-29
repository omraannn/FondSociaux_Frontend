import { apiAuth } from "../config/axiosConfig";

class typeFeesService {

    /*|--------------------------------------------------------------------------
    | Fetch Type fees without permissions
    |-------------------------------------------------------------------------- */
    async getTypeFeesAll() {
        try {
            const response = await apiAuth.get('/type-fees/all');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch type fees");
            }
        }
    }

    /*|--------------------------------------------------------------------------
      | Fetch Type fees
      |-------------------------------------------------------------------------- */
    async getTypeFees(page = 1, pageSize = 10, filters = {}) {
        try {
            const response = await apiAuth.get('/type-fees', {
                params: {
                    page: page,
                    per_page: pageSize,
                    ...filters,
                },
            });
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch type fees");
            }
        }
    }

    /*|--------------------------------------------------------------------------
  | Fetch Type fee
  |-------------------------------------------------------------------------- */
    async getTypeFeesById(id:any) {
        try {
            const response = await apiAuth.get(`/type-fees/fetch-type-fee/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch type fee");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Store type fee
    |-------------------------------------------------------------------------- */
    async createTypeFee(typeFeeData:any) {
        try {
            const response = await apiAuth.post('/type-fees/store-type-fee', typeFeeData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to create type fee");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Update type fee
    |-------------------------------------------------------------------------- */
    async updateTypeFee(id:any, typeFeeData:any) {
        try {
            const response = await apiAuth.post(`/type-fees/update-type-fee/${id}`, typeFeeData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update type fee");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Delete type fee
    |-------------------------------------------------------------------------- */
    async deleteTypeFee(id:any) {
        try {
            const response = await apiAuth.delete(`/type-fees/delete-type-fee/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete type fee");
            }
        }
    }
}

export default new typeFeesService();
