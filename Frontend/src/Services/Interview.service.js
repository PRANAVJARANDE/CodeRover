import { toast } from 'react-hot-toast';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const resolvedBackendURL = () => {
  try {
    const url = new URL(backendURL);
    const frontendHost = window.location.hostname;
    const backendIsLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const frontendIsLocalhost = frontendHost === 'localhost' || frontendHost === '127.0.0.1';

    if (backendIsLocalhost && !frontendIsLocalhost) {
      url.hostname = frontendHost;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return backendURL;
  }

  return backendURL;
};

const authHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const createInterviewService = async (interviewData) => {
  try {
    const response = await fetch(`${resolvedBackendURL()}/interviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(interviewData),
    });

    const data = await response.json();
    if (response.status === 201) {
      toast.success('Interview scheduled');
      return data.data;
    }

    toast.error(data?.message || 'Failed to schedule interview');
    return null;
  } catch (error) {
    console.error(error);
    toast.error('Server Error');
    return null;
  }
};

export const getMyInterviewsService = async () => {
  try {
    const response = await fetch(`${resolvedBackendURL()}/interviews/my`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    }

    toast.error(data?.message || 'Failed to fetch interviews');
    return [];
  } catch (error) {
    console.error(error);
    toast.error('Server Error');
    return [];
  }
};

export const getInterviewByRoomIdService = async (roomId) => {
  try {
    const response = await fetch(`${resolvedBackendURL()}/interviews/room/${roomId}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    }

    toast.error(data?.message || 'Unable to load interview');
    return null;
  } catch (error) {
    console.error(error);
    toast.error('Server Error');
    return null;
  }
};

export const updateInterviewRoomStateService = async (roomId, roomState) => {
  try {
    const response = await fetch(`${resolvedBackendURL()}/interviews/room/${roomId}/state`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(roomState),
    });

    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    }

    console.error(data?.message || 'Unable to save room state');
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getVerificationUploadService = async (requestId) => {
  try {
    const response = await fetch(`${resolvedBackendURL()}/interviews/verification/${requestId}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const uploadVerificationVideoService = async ({ roomId, code, requestId, duration, video }) => {
  try {
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('code', code);
    formData.append('requestId', requestId);
    formData.append('duration', duration);
    formData.append('video', video);

    const response = await fetch(`${resolvedBackendURL()}/interviews/verification/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.status === 200) {
      return data.data;
    }

    throw new Error(data?.message || 'Unable to upload verification video');
  } catch (error) {
    console.error(error);
    throw error;
  }
};
