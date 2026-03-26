import axios from "axios";

// ✅ Get Access Token
const getZoomAccessToken = async () => {
  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {},
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET
          ).toString("base64"),
      },
    }
  );

  return response.data.access_token;
};

// ✅ Create Meeting
export const createZoomMeeting = async (date, time) => {
  try {
    const token = await getZoomAccessToken();

    const [day, month, year] = date.split("-");
    const startTime = new Date(`${year}-${month}-${day}T${time}:00`);

    const response = await axios.post(
      `https://api.zoom.us/v2/users/me/meetings`, // ✅ use 'me'
      {
        topic: "Appointment Meeting",
        type: 2,
        start_time: startTime.toISOString(),
        duration: 30,
        timezone: "Asia/Kolkata",
        settings: {
          join_before_host: false,
          waiting_room: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ correct
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("❌ Zoom Error:", error.response?.data || error.message);
    throw new Error("Zoom meeting creation failed");
  }
};