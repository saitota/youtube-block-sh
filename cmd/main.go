package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/urfave/cli/v2"
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
	auth := os.Getenv("YOUTUBE_AUTH")
	if auth == "" {
		return fmt.Errorf("YOUTUBE_AUTH environment variable is not set")
	}
	cookie := os.Getenv("YOUTUBE_COOKIE")
	if cookie == "" {
		return fmt.Errorf("YOUTUBE_COOKIE environment variable is not set")
	}
	fmt.Println("Len YOUTUBE_AUTH:", len(strings.TrimSpace(auth)))
	fmt.Println("Len YOUTUBE_COOKIE:", len(strings.TrimSpace(cookie)))

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", strings.TrimSpace(auth))
	request.Header.Set("Cookie", strings.TrimSpace(cookie))
	request.Header.Set("X-Goog-AuthUser", "0")
	request.Header.Set("X-Origin", "https://www.youtube.com")
	request.Header.Set("Content-Type", "application/json")
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

var (
	flags = struct {
		kidID       *cli.StringFlag
		channelName *cli.StringFlag
	}{
		kidID: &cli.StringFlag{
			Name:     "kid-id",
			Aliases:  []string{"k"},
			Required: true,
			Usage:    "Kid's Gaia ID",
		},
		channelName: &cli.StringFlag{
			Name:     "channel-name",
			Aliases:  []string{"c"},
			Required: true,
			Usage:    "YouTube channel name",
		},
	}
)

func New() *cli.App {
	app := cli.NewApp()
	app.Name = "youtube-block"
	app.Usage = "YouTube channel blocking tool for supervised accounts"
	app.Action = func(c *cli.Context) error {
		kidID := c.String("kid-id")
		channelName := strings.TrimPrefix(c.String("channel-name"), "@")
		fmt.Printf("channelName %s\n", channelName)
		channelID, err := getChannelID(channelName)
		if err != nil {
			return fmt.Errorf("failed to get channel ID: %w", err)
		}
		fmt.Printf("channelId %s\n", channelID)
		if err := blockChannel(channelID, kidID); err != nil {
			return fmt.Errorf("failed to block channel: %w", err)
		}
		fmt.Printf("done, blocked channel @%s for kid %s\n", channelName, kidID)
		return nil
	}
	app.Flags = []cli.Flag{
		flags.kidID,
		flags.channelName,
	}

	return app
}

func main() {
	if err := New().Run(os.Args); err != nil {
		panic(err)
	}
}
