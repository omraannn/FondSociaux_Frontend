import { apiAuth } from "../config/axiosConfig";

class categoryService {

    /*|--------------------------------------------------------------------------
    | Fetch all
    |-------------------------------------------------------------------------- */
    async getCategoriesAll() {
        try {
            const response = await apiAuth.get('/categories/all');
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
    | Fetch categories
    |-------------------------------------------------------------------------- */
    async getCategories(page = 1, pageSize = 10,  filters = {}) {
        try {
            const response = await apiAuth.get('/categories', {
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
                throw new Error("Failed to fetch categories");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Store category
    |-------------------------------------------------------------------------- */
    async createCategory(categoryData:any) {
        try {
            const response = await apiAuth.post('/categories/store-category', categoryData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to create category");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Update categories
    |-------------------------------------------------------------------------- */
    async updateCategory(id:any, categoryData:any) {
        try {
            const response = await apiAuth.post(`/categories/update-category/${id}`, categoryData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update category");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Delete categories
    |-------------------------------------------------------------------------- */
    async deleteCategory(id:any) {
        try {
            const response = await apiAuth.delete(`/categories/delete-category/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete category");
            }
        }
    }
}

export default new categoryService();
