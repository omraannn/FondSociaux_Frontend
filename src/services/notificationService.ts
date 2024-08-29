import { apiAuth } from "../config/axiosConfig";

class categoryService {

    /*|--------------------------------------------------------------------------
    | fetch Pending employee for notifications
    |-------------------------------------------------------------------------- */
    async getPendingEmployeeAll() {
        try {
            const response = await apiAuth.get('/users/pending-employee-all');
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
    | fetch Pending refunds for notifications
    |-------------------------------------------------------------------------- */
    async getPendingRefundDemandsAll() {
        try {
            const response = await apiAuth.get('/refunds/refunds-pending-all');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch pending refunds");
            }
        }
    }
}

export default new categoryService();