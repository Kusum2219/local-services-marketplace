import axios from "axios";

const API_URL = "http://localhost:5000/api";

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  isActive: boolean;
  vendor: {
  id: string;
  businessName: string;
  description: string | null;
  phone: string | null;
  location: string | null;
  isVerified: boolean;
};
  category: {
    id: string;
    name: string;
  };
}

export const getServices = async (): Promise<Service[]> => {
  const response = await axios.get(`${API_URL}/services`);

  return response.data.services;
};

export const getServiceById = async (
  serviceId: string
): Promise<Service> => {
  const response = await axios.get(
    `${API_URL}/services/${serviceId}`
  );

  return response.data.service;
};