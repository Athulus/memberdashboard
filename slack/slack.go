package slack

import (
	"encoding/json"
	"errors"
	"fmt"
	"memberserver/config"
	"memberserver/database"
	"net/http"

	log "github.com/sirupsen/logrus"
)

type Profile struct {
	DisplayName string `json:"display_name"`
	RealName    string `json:"real_name"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
}

type SlackUser struct {
	Name     string  `json:"name"`
	RealName string  `json:"real_name"`
	Profile  Profile `json:"profile"`
	IsBot    bool    `json:"is_bot"`
	Deleted  bool    `json:"deleted"`
}

type SlackUserResponse struct {
	Members []SlackUser `json:"members"`
}

func GetSlackUsers() ([]SlackUser, error) {
	conf, _ := config.Load()
	var slackUsers []SlackUser
	if len(conf.SlackToken) == 0 {
		return slackUsers, errors.New("slack Token not found")
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", `https://slack.com/api/users.list`, nil)
	if err != nil {
		return slackUsers, err
	}
	req.Header.Add("Authorization", "Bearer "+conf.SlackToken)

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return slackUsers, err
	}
	defer res.Body.Close()

	var slackUsersResponse SlackUserResponse

	err = json.NewDecoder(res.Body).Decode(&slackUsersResponse)
	if err != nil {
		return slackUsers, err
	}

	slackUsers = slackUsersResponse.Members

	return slackUsers, err
}

func FindNonMembers() []string {
	var nonMembers []string

	users, err := GetSlackUsers()
	if err != nil {
		log.Errorf("error fetching slack users: %s", err)
	}
	db, _ := database.Setup()

	members := db.GetMembers()
	memberMap := make(map[string]database.Member)

	for _, m := range members {
		memberMap[m.Email] = m
	}

	for _, u := range users {
		if u.IsBot {
			continue
		}

		if u.Deleted {
			continue
		}

		_, ok := memberMap[u.Profile.Email]
		if !ok {
			nonMembers = append(nonMembers, u.RealName+", "+u.Profile.Email)
		}
	}
	return nonMembers
}
