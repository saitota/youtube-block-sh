// Background service worker

// Import required modules
importScripts('storage.js', 'api.js');

// Create context menu on extension startup
chrome.runtime.onStartup.addListener(createContextMenu);
chrome.runtime.onInstalled.addListener(async () => {
  createContextMenu();
  
  // Remove Origin header for YouTube API requests
  const rules = [{
    id: 1,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [{ header: 'Origin', operation: 'remove' }]
    },
    condition: {
      initiatorDomains: [chrome.runtime.id],
      urlFilter: "*youtubei/v1/kids/update_blacklist*",
      resourceTypes: ['xmlhttprequest']
    }
  }];
  
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules
  });
  
});

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "blockChannel",
      title: "Block channel for Kids (With full auth log)",
      contexts: ["page", "link"],
      documentUrlPatterns: ["https://www.youtube.com/*"]
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "blockChannel") {
    await handleBlockChannel(tab, info);
  }
});

// Handle block channel request
async function handleBlockChannel(tab, clickInfo = null) {
  try {
    // Get current settings
    const settings = await getSettings();
    
    if (settings.kidIds.length === 0) {
      showNotification("No Kids IDs configured", "Please add Kids IDs in settings first", "error");
      return;
    }
    
    if (!settings.authHeaders.authorization || !settings.authHeaders.cookie) {
      showNotification("Authentication required", "Please configure auth headers in settings", "error");
      return;
    }
    
    // Get channel info from current page or clicked link
    const channelInfo = await getChannelInfoFromPage(tab.id, clickInfo);
    if (!channelInfo) {
      showNotification("Channel not found", "Unable to detect channel from current page or link", "error");
      return;
    }
    
    // Block channel for all kids
    const results = await blockChannelForAllKids(
      channelInfo.channelId,
      settings.kidIds,
      settings.authHeaders
    );
    
    // Log essential operation details only
    const successCount = results.filter(r => r.success).length;
    await addLog({
      channelName: channelInfo.channelName,
      success: successCount === results.length,
      kidCount: results.length,
      errors: results.filter(r => !r.success).map(r => r.error).join('; ')
    });
    
    // Show notification
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      showNotification(
        "Channel blocked successfully",
        `Blocked @${channelInfo.channelName} for ${successCount} kid(s)`,
        "success"
      );
    } else {
      showNotification(
        "Partial failure",
        `Blocked for ${successCount}/${totalCount} kid(s). Check logs for details.`,
        "error"
      );
    }
    
  } catch (error) {
    console.error("Block channel error:", error);
    showNotification("Error", error.message, "error");
  }
}

// Get channel info from current page or clicked link
async function getChannelInfoFromPage(tabId, clickInfo = null) {
  try {
    let channelName = null;
    
    // Try link URL first
    if (clickInfo?.linkUrl) {
      const match = clickInfo.linkUrl.match(/youtube\.com\/@([^/?#]+)/);
      if (match) channelName = match[1];
    }
    
    // Fallback to current page
    if (!channelName) {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const urlMatch = window.location.href.match(/youtube\.com\/@([^/?]+)/);
          if (urlMatch) return urlMatch[1];
          
          const channelLink = document.querySelector('a[href*="/@"]');
          if (channelLink) {
            const linkMatch = channelLink.href.match(/@([^/?]+)/);
            if (linkMatch) return linkMatch[1];
          }
          
          return null;
        }
      });
      channelName = results[0]?.result;
    }
    
    if (!channelName) return null;
    
    const channelId = await fetchChannelId(channelName);
    return { channelName, channelId };
    
  } catch (error) {
    console.error("Failed to get channel info:", error);
    return null;
  }
}


// Block channel for all kid accounts
async function blockChannelForAllKids(channelId, kidIds, authHeaders) {
  const results = [];
  
  for (const kidId of kidIds) {
    try {
      await blockChannel(channelId, kidId, authHeaders, true);
      results.push({ kidId, success: true });
    } catch (error) {
      results.push({ kidId, success: false, error: error.message });
    }
  }
  
  return results;
}


// Show notification to user
function showNotification(title, message, type = "info") {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-toolbar.png",
    title: title,
    message: message
  });
}