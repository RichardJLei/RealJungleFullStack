import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./axiosInstance";

export const sqlDataProvider: DataProvider = {
  getList: async ({ resource, pagination }) => {
    const { current = 1, pageSize = 10 } = pagination || {};
    
    const response = await axiosInstance.get(`/${resource}`, {
      params: {
        _start: (current - 1) * pageSize,
        _end: current * pageSize,
      },
    });

    return {
      data: response.data,
      total: response.headers["x-total-count"],
    };
  },
  // Add other required methods (getOne, create, update, delete) as needed
}; 