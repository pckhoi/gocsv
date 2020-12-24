package main

import (
	"encoding/csv"
	"io"
	"log"
	"os"
	"time"
)

func main() {
	f, err := os.Open("benchmark/players_20.csv")
	if err != nil {
		log.Fatal(err)
	}
	start := time.Now()

	r := csv.NewReader(f)
	for {
		_, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
	}

	elapsed := time.Since(start)
	log.Printf("Read players_20.csv took %s", elapsed)
}
