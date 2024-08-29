import { apiAuth } from '../config/axiosConfig';

class statsService {

    /*|--------------------------------------------------------------------------
    | Get monthly refund status
    |-------------------------------------------------------------------------- */
    async getRefundStatistics(period = 'monthly', employeeId = null, feeTypeId = null, year = null) {
        try {
            const endpoint = '/stats/refund-statistics';

            const params:any = {
                period,
                employeeId,
                feeTypeId,
                year
            };

            Object.keys(params).forEach((key:any) => params[key] == null && delete params[key]);

            const response = await apiAuth.get(endpoint, { params });

            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch categories");
            }
        }
    }



    /*|--------------------------------------------------------------------------
    | Get monthly refund status for auth employee
    |-------------------------------------------------------------------------- */
    async getMonthlyRefundStatsAuth(year:any) {
        try {
            const response = await apiAuth.get('/stats/refund-monthly-statistics-auth', {
                params: { year }
            });
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch categories");
            }
        }
    }
}
export default new statsService();