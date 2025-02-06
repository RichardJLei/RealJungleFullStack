import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "./axiosInstance";

export const dataProvider = (apiUrl: string): DataProvider => ({
  getList: async ({ resource, pagination, sorters }) => {
    console.log("[Data Provider] API URL:", apiUrl);
    console.log("[Data Provider] Making request to:", `${apiUrl}/${resource}/`);
    
    const params: any = {
      _start: (pagination.current - 1) * pagination.pageSize,
      _end: pagination.current * pagination.pageSize,
    };

    // Handle sorting
    if (sorters && sorters.length > 0) {
      params._sort = sorters[0].field;
      params._order = sorters[0].order;
    }

    const response = await axiosInstance.get(`${apiUrl}/${resource}/`, { params });

    console.log("[Data Provider] Response headers:", response.headers);
    console.log("[Data Provider] Raw total header:", response.headers["x-total-count"]);
    console.log("[Data Provider] Parsed total:", parseInt(response.headers["x-total-count"]));
    console.log("[Data Provider] Response data length:", response.data.length);

    return {
      data: response.data,
      total: parseInt(response.headers["x-total-count"]),
    };
  },

  getOne: async ({ resource, id }) => {
    const response = await axiosInstance.get(`${apiUrl}/${resource}/${id}`);
    return {
      data: response.data,
    };
  },

  // Add these required methods as stubs
  create: async ({ resource, variables }) => {
    throw new Error("Not implemented");
  },
  update: async ({ resource, id, variables }) => {
    throw new Error("Not implemented");
  },
  deleteOne: async ({ resource, id }) => {
    throw new Error("Not implemented");
  },
  // Add other required methods (getOne, create, update, delete) as needed
}); 