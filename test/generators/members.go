package main

import (
	"math/rand"
	"memberserver/database"
	"os"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/Rhymond/go-money"
	"syreclabs.com/go/faker"
)

var tiers = []int64{0, 0, 0, 30, 35, 50}

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Provide an argument for # of members to create.")
	}
	count, err := strconv.Atoi(os.Args[1])
	if err != nil {
		log.Fatalf("Unable to parse %v as count.", os.Args[1])
	}

	rand.Seed(time.Now().UnixNano())
	db, _ := database.Setup()
	defer db.Release()
	for i := 0; i < count; i++ {
		member := fakeMember()
		db.AddMembers([]database.Member{member})
		log.Printf("Added member %v", member.Name)
		if member.Level > 1 {
			member, _ = db.GetMemberByEmail(member.Email)
			lastPayment := time.Now().AddDate(0, 0, -rand.Intn(70))
			numPayments := rand.Intn(6)
			log.Printf("Creating %v payments", numPayments)
			payments := fakePaymentHistory(member, lastPayment, numPayments)
			db.AddPayments(payments)
		}
	}
}

func fakeMember() database.Member {
	level, _ := strconv.Atoi(faker.Number().Between(1, 5))
	resources := []database.MemberResource{}
	return database.Member{
		Name:      faker.Name().Name(),
		Email:     faker.Internet().Email(),
		Level:     uint8(level),
		RFID:      faker.Lorem().Characters(10),
		Resources: resources,
	}
}

func fakePaymentHistory(member database.Member, lastPayment time.Time, numberOfPayments int) []database.Payment {
	payments := []database.Payment{}
	for i := 0; i < numberOfPayments; i++ {
		paymentDate := lastPayment.AddDate(0, -i, 0)
		payments = append(payments, database.Payment{
			ID:       faker.Number().Number(8),
			Date:     paymentDate,
			Amount:   *money.New(tiers[member.Level]*100, "USD"),
			Provider: 1,
			MemberID: member.ID,
			Email:    member.Email,
			Name:     member.Name,
		})
	}
	return payments
}
