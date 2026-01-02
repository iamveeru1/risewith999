const BASE_URL = 'https://testing.careercounseling.cloud';

// Get all buyers
export const getAllBuyers = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/buyers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to fetch buyers',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};

// Create a new buyer
export const createBuyer = async (
    name: string,
    email: string,
    phone: string
) => {
    try {
        const response = await fetch(`${BASE_URL}/api/buyers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to create buyer',
            };
        }

        return {
            success: true,
            data: data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};

// Update a buyer
export const updateBuyer = async (
    id: string,
    name: string,
    email: string,
    phone: string
) => {
    try {
        const response = await fetch(`${BASE_URL}/api/buyers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to update buyer',
            };
        }

        return {
            success: true,
            data: data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};

// Delete a buyer
export const deleteBuyer = async (id: string) => {
    try {
        const response = await fetch(`${BASE_URL}/api/buyers/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to delete buyer',
            };
        }

        return {
            success: true,
            data: data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};

// Generate access code for a buyer
export const generateAccessCode = async (
    buyerId: string,
    durationMinutes: number = 60
) => {
    try {
        const response = await fetch(`${BASE_URL}/api/access/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ buyerId, durationMinutes }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to generate access code',
            };
        }

        return {
            success: true,
            data: data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};
