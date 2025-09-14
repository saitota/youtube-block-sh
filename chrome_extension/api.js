// YouTube Kids API communication
// Reference: cmd/main.go:98-160

const API_CONSTANTS = {
  ENDPOINT: "https://www.youtube.com/youtubei/v1/kids/update_blacklist?prettyPrint=false",
  CHANNEL_URL_TEMPLATE: "https://www.youtube.com/@{channelName}/about",
  CLIENT_NAME: "WEB",
  CLIENT_VERSION: "2.20241101.01.00",
  ACTION_BLOCK: "BLOCKLIST_ACTION_BLOCK",
  CHANNEL_ID_REGEX: /channel_id=([^"]+)/
};

// Block channel for a specific kid account
async function blockChannel(channelId, kidId, authHeaders, enableDetailedLog = false) {
  const requestBody = {
    context: {
      client: {
        clientName: API_CONSTANTS.CLIENT_NAME,
        clientVersion: API_CONSTANTS.CLIENT_VERSION
      }
    },
    items: [{
      externalChannelId: channelId,
      action: API_CONSTANTS.ACTION_BLOCK
    }],
    kidGaiaId: kidId
  };

  if (enableDetailedLog) {
    console.log("🚀 DETAILED REQUEST LOG:");
    console.log("URL:", API_CONSTANTS.ENDPOINT);
    console.log("Authorization:", authHeaders.authorization);
    console.log("Cookie:", authHeaders.cookie);
    console.log("Body:", JSON.stringify(requestBody, null, 2));
  }

  const response = await fetch(API_CONSTANTS.ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeaders.authorization,
      "Cookie": authHeaders.cookie,
      "X-Goog-AuthUser": "0",
      "X-Origin": "https://www.youtube.com"
    },
    body: JSON.stringify(requestBody)
  });

  if (enableDetailedLog) {
    console.log("📥 RESPONSE:", response.status, response.statusText);
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// Get channel ID from channel name
async function fetchChannelId(channelName) {
  const url = API_CONSTANTS.CHANNEL_URL_TEMPLATE.replace("{channelName}", channelName);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch channel page: ${response.status}`);
  }

  const html = await response.text();
  const matches = html.match(API_CONSTANTS.CHANNEL_ID_REGEX);
  
  if (!matches) {
    throw new Error(`Channel ID not found for @${channelName}`);
  }

  return matches[1];
}

