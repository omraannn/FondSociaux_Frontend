import {apiAuth, apiFormData} from "../config/axiosConfig";

class refundService {

   /*|--------------------------------------------------------------------------
   | Fetch refund demands of auth user
   |-------------------------------------------------------------------------- */
    async getAuthRefunds() {
        try {
            const response = await apiAuth.get('/refunds-employee/refunds-auth');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch refunds");
            }
        }
    }

    /*|--------------------------------------------------------------------------
    | Fetch last 8 refund demands
    |-------------------------------------------------------------------------- */
    async getLast8RefundDemands() {
        try {
            const response = await apiAuth.get('/refunds-employee/refunds-last-5');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch refunds");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | store refund demand
    |-------------------------------------------------------------------------- */
    async storeRefundDemand(refundDemandData:any) {
        try {
            const response = await apiFormData.post('/refunds-employee/refund-store', refundDemandData);
            console.log(response)
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to send refund demand");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Cancel a refund demand
    |-------------------------------------------------------------------------- */
    async cancelRefundDemand(id:any) {
        try {
            const response = await apiAuth.post(`/refunds-employee/refund-cancel/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to cancel refund demand");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    |
    |                           Manage refunds Section
    |
    |-------------------------------------------------------------------------- */

    /*|--------------------------------------------------------------------------
    | fetch all refund demands
    |-------------------------------------------------------------------------- */
    async getRefundDemands() {
        try {
            const response = await apiAuth.get('/refunds/refund-demands');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch refunds :admin");
            }
        }
    }

    /*|--------------------------------------------------------------------------
     | Reject a refund demand
     |-------------------------------------------------------------------------- */
    async rejectRefundDemand(id:any, comment:any) {
        try {
            const response = await apiAuth.post(`/refunds/refund/${id}/reject`, {comment});
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to reject refund demand");
            }
        }
    }

    /*|--------------------------------------------------------------------------
   | Cancel a refund demand
   |-------------------------------------------------------------------------- */
    async deleteRefundDemand(id:any) {
        try {
            const response = await apiAuth.post(`/refunds/refund-delete/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete refund demand");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Accept a refund demand
    |-------------------------------------------------------------------------- */
    async acceptRefundDemand(id:any, comment:any) {
        try {
            const response = await apiAuth.post(`/refunds/refund/${id}/accept`, {comment});
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to accept refund demand");
            }
        }
    }

    /*|--------------------------------------------------------------------------
  | store refund demand
  |-------------------------------------------------------------------------- */
    async storeRefundDemandByAdmin(refundDemandData:any) {
        try {
            const response = await apiFormData.post('/refunds/refunds-store-by-RH', refundDemandData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to store refund");
            }
        }
    }


    /*|--------------------------------------------------------------------------
  | Update a refund demand by employee
  |-------------------------------------------------------------------------- */
    async updateRefund(id:any, refundDemandData:any) {
        try {
            const response = await apiFormData.post(`/refunds-employee/refund-update/${id}`, refundDemandData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update refund demand");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Update a refund demand by admin RH
    |-------------------------------------------------------------------------- */
    async updateRefundByRh(id:any, user_id:any, refundDemandData:any) {
        try {
            const response = await apiFormData.post(`/refunds/refund-update-by-rh/${id}/${user_id}`, refundDemandData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update refund demand");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Update the refund payment status
    |-------------------------------------------------------------------------- */
    async updatePayedStatus(ids:any, payed:any) {
        try {
            const response = await apiAuth.post('/refunds/refunds-update-payed', { ids, payed });
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update payed status");
            }
        }
    }

}

export default new refundService();