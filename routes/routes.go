package routes

import (
	"fmt"
	"net/http"
	"os"

	"log"

	"github.com/gorilla/mux"

	"github.com/dfirebaugh/memberserver/config"
	"github.com/dfirebaugh/memberserver/database"
)

// Setup - setup us up the routes
func Setup() {
	var err error

	c, _ := config.Load(os.Getenv("MEMBER_SERVER_CONFIG_FILE"))
	r := mux.NewRouter()

	api := &API{}
	api.config = c
	api.db, err = database.Setup()

	if err != nil {
		log.Fatal(fmt.Errorf("error setting up db: %s", err))
	}

	r.HandleFunc("/api/resource", api.authJWT(api.Resource)).Methods(http.MethodPost, http.MethodDelete, http.MethodGet)

	r.HandleFunc("/api/tier", api.authJWT(api.getTiers))
	r.HandleFunc("/api/member", api.authJWT(api.getMembers))
	r.HandleFunc("/api/user", api.authJWT(api.getUser))

	r.HandleFunc("/register", api.Signup)
	r.HandleFunc("/signin", api.Signin)
	r.HandleFunc("/logout", api.authJWT(api.Logout))

	spa := spaHandler{staticPath: ".", indexPath: "index.html"}
	r.PathPrefix("/").Handler(spa)

	http.Handle("/", r)
}
