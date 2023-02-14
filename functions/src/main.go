package main

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

func main() {
	opt := option.WithCredentialsFile("../key.json")
	_, err := firebase.NewApp(context.Background(), nil, opt) //replace _ with "app" when we want to use it :)
	if err != nil {
		fmt.Errorf("error initializing app: %v", err)
	}

}
