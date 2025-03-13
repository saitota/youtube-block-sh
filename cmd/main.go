package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
)

type UpdateBlacklistRequest struct {
	Context struct {
		Client struct {
			ClientName    string `json:"clientName"`
			ClientVersion string `json:"clientVersion"`
		} `json:"client"`
	} `json:"context"`
	Items []struct {
		ExternalChannelID string `json:"externalChannelId"`
		Action            string `json:"action"`
	} `json:"items"`
	KidGaiaID string `json:"kidGaiaId"`
}

// parseArgs は引数を解析し、kidIDとchannelNameを返します
func parseArgs() (kidID string, channelName string, err error) {
	flag.StringVar(&kidID, "kid-id", "", "Kid's ID (required)")
	flag.StringVar(&channelName, "channel-name", "", "Channel name (required)")
	flag.Parse()

	if kidID == "" {
		return "", "", fmt.Errorf("kid-id is required")
	}

	if channelName == "" {
		return "", "", fmt.Errorf("channel-name is required")
	}

	// @から始まる場合は削除
	channelName = strings.TrimPrefix(channelName, "@")

	return kidID, channelName, nil
}

func getChannelID(channelName string) (string, error) {
	resp, err := http.Get(fmt.Sprintf("https://www.youtube.com/@%s/about", channelName))
	if err != nil {
		return "", fmt.Errorf("failed to fetch channel page: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	re := regexp.MustCompile(`channel_id=([^"]+)`)
	matches := re.FindStringSubmatch(string(body))
	if len(matches) < 2 {
		return "", fmt.Errorf("channel ID not found")
	}

	return matches[1], nil
}

// processChannel は与えられたパラメータに基づいてチャンネル情報を処理します
func processChannel(kidID, channelName string) error {
	fmt.Printf("channelName %s\n", channelName)
	channelID, err := getChannelID(channelName)
	if err != nil {
		return fmt.Errorf("failed to get channel ID: %w", err)
	}

	fmt.Printf("channelId %s\n", channelID)
	if err := blockChannel(channelID, kidID); err != nil {
		return fmt.Errorf("failed to block channel: %w", err)
	}

	return nil
}

func blockChannel(channelID, kidID string) error {
	req := UpdateBlacklistRequest{
		Context: struct {
			Client struct {
				ClientName    string `json:"clientName"`
				ClientVersion string `json:"clientVersion"`
			} `json:"client"`
		}{
			Client: struct {
				ClientName    string `json:"clientName"`
				ClientVersion string `json:"clientVersion"`
			}{
				ClientName:    "WEB",
				ClientVersion: "2.20241101.01.00",
			},
		},
		Items: []struct {
			ExternalChannelID string `json:"externalChannelId"`
			Action            string `json:"action"`
		}{
			{
				ExternalChannelID: channelID,
				Action:            "BLOCKLIST_ACTION_BLOCK",
			},
		},
		KidGaiaID: kidID,
	}

	jsonData, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	client := &http.Client{}
	request, err := http.NewRequest("POST", "https://www.youtube.com/youtubei/v1/kids/update_blacklist?prettyPrint=false", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// 環境変数からヘッダー値を取得
	auth := os.Getenv("YOUTUBE_AUTH")
	if auth == "" {
		return fmt.Errorf("YOUTUBE_AUTH environment variable is not set")
	}

	cookie := os.Getenv("YOUTUBE_COOKIE")
	if cookie == "" {
		return fmt.Errorf("YOUTUBE_COOKIE environment variable is not set")
	}

	// ヘッダーの設定
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", auth)
	request.Header.Set("Cookie", cookie)
	request.Header.Set("X-Goog-AuthUser", "0")
	request.Header.Set("X-Origin", "https://www.youtube.com")

	resp, err := client.Do(request)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("request failed with status: %d", resp.StatusCode)
	}

	return nil
}

func main() {
	kidID, channelName, err := parseArgs()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		flag.Usage()
		os.Exit(1)
	}

	if err := processChannel(kidID, channelName); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("done, blocked channel %s for kid %s\n", channelName, kidID)
}
